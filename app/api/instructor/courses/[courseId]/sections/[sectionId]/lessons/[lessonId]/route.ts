import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, sectionId, lessonId } = await params;

  const body = await req.json();
  const lesson = await prisma.lesson.update({ where: { id: lessonId }, data: body });

  // Update total duration
  if (body.duration !== undefined) {
    const totalDuration = await prisma.lesson.aggregate({
      where: { section: { courseId } },
      _sum: { duration: true },
    });
    await prisma.course.update({
      where: { id: courseId },
      data: { totalDuration: totalDuration._sum.duration || 0 },
    });
  }

  return NextResponse.json(lesson);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string; sectionId: string; lessonId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, sectionId, lessonId } = await params;

  await prisma.lesson.delete({ where: { id: lessonId } });

  const totalLessons = await prisma.lesson.count({ where: { section: { courseId } } });
  await prisma.course.update({ where: { id: courseId }, data: { totalLessons } });

  return NextResponse.json({ success: true });
}
