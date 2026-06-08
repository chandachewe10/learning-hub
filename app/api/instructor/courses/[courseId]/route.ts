import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...body,
      publishedAt: body.status === "PUBLISHED" ? new Date() : course.publishedAt,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ success: true });
}
