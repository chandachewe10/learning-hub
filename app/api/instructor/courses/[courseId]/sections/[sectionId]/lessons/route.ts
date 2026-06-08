import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string; sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, sectionId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const lesson = await prisma.lesson.create({
    data: { ...body, sectionId, order: body.order ?? 0 },
  });

  // Update course lesson count
  const totalLessons = await prisma.lesson.count({ where: { section: { courseId } } });
  await prisma.course.update({ where: { id: courseId }, data: { totalLessons } });

  return NextResponse.json(lesson, { status: 201 });
}
