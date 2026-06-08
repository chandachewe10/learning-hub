import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enrollmentId, lessonId } = await req.json();

  // Verify enrollment belongs to user
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { include: { sections: { include: { lessons: true } } } } },
  });

  if (!enrollment || enrollment.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Upsert progress
  const progress = await prisma.progress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    create: {
      enrollmentId,
      lessonId,
      userId: session.user.id,
      completedAt: new Date(),
    },
    update: { completedAt: new Date() },
  });

  // Calculate completion percentage
  const totalLessons = enrollment.course.sections.flatMap((s) => s.lessons).length;
  const completedCount = await prisma.progress.count({
    where: { enrollmentId, completedAt: { not: null } },
  });
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPct,
      lastAccessedAt: new Date(),
      completedAt: progressPct >= 100 ? new Date() : null,
    },
  });

  // Issue certificate if completed
  if (progressPct >= 100) {
    await prisma.certificate.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: enrollment.courseId } },
      create: {
        userId: session.user.id,
        courseId: enrollment.courseId,
      },
      update: {},
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Course Completed!",
        message: `You've completed "${enrollment.course.title}". Your certificate is ready!`,
        type: "CERTIFICATE",
        link: "/student/certificates",
      },
    });
  }

  return NextResponse.json({ progress, progressPct });
}
