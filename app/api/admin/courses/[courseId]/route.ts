import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const body = await req.json();

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...body,
      publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
    },
    include: { instructor: { select: { name: true, email: true } } },
  });

  // Notify instructor
  if (body.status) {
    await prisma.notification.create({
      data: {
        userId: course.instructorId,
        title: body.status === "PUBLISHED" ? "Course Approved!" : "Course Update",
        message: body.status === "PUBLISHED"
          ? `Your course "${course.title}" has been approved and is now live.`
          : `Your course "${course.title}" status has been updated to ${body.status.toLowerCase()}.`,
        type: "COURSE_UPDATE",
        link: `/instructor/courses/${course.id}/edit`,
      },
    });
  }

  return NextResponse.json(course);
}
