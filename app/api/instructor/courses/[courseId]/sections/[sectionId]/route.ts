import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string; sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, sectionId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.section.delete({ where: { id: sectionId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string; sectionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId, sectionId } = await params;

  const body = await req.json();
  const updated = await prisma.section.update({ where: { id: sectionId }, data: body });
  return NextResponse.json(updated);
}
