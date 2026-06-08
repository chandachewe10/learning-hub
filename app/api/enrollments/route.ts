import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEnrollmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, price: true, isSubscriptionOnly: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Only allow free enrollment for free courses
  if (course.price > 0 || course.isSubscriptionOnly) {
    return NextResponse.json({ error: "This course requires payment" }, { status: 403 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });

  if (existing) {
    return NextResponse.json({ enrollment: existing });
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: session.user.id, courseId },
  });

  // Notification
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Enrollment Confirmed",
      message: `You've been enrolled in "${course.title}"`,
      type: "ENROLLMENT",
      link: `/student/learn/${courseId}`,
    },
  });

  // Email (non-blocking)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
  if (user?.email) {
    sendEnrollmentEmail(
      user.email,
      user.name!,
      course.title,
      `${process.env.NEXT_PUBLIC_APP_URL}/student/learn/${courseId}`
    ).catch(console.error);
  }

  return NextResponse.json({ enrollment }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    return NextResponse.json({ enrollment });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          totalLessons: true,
          instructor: { select: { name: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json({ enrollments });
}
