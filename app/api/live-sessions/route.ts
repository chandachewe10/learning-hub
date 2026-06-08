import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, courseId, scheduledAt, maxAttendees } = await req.json();
  if (!title || !courseId || !scheduledAt) {
    return NextResponse.json({ error: "title, courseId, scheduledAt required" }, { status: 400 });
  }

  const jitsiRoomId = `learnhub-${nanoid(12)}`;

  const liveSession = await prisma.liveSession.create({
    data: {
      title,
      description,
      courseId,
      instructorId: session.user.id,
      scheduledAt: new Date(scheduledAt),
      jitsiRoomId,
      maxAttendees,
    },
    include: { course: { select: { title: true } } },
  });

  // Notify enrolled students
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { userId: true },
  });

  if (enrollments.length > 0) {
    await prisma.notification.createMany({
      data: enrollments.map((e) => ({
        userId: e.userId,
        title: "Live Session Scheduled",
        message: `"${title}" is scheduled for ${new Date(scheduledAt).toLocaleString()}`,
        type: "LIVE_SESSION" as const,
        link: `/live/${jitsiRoomId}`,
      })),
    });
  }

  return NextResponse.json({ session: liveSession }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const where = courseId
    ? { courseId }
    : session?.user.role === "INSTRUCTOR"
    ? { instructorId: session.user.id }
    : {};

  const sessions = await prisma.liveSession.findMany({
    where,
    include: { course: { select: { title: true } }, instructor: { select: { name: true } } },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json({ sessions });
}
