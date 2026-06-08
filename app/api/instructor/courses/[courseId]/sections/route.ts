import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title, order } = await req.json();
  const section = await prisma.section.create({
    data: { title, order: order ?? 0, courseId },
  });
  return NextResponse.json(section, { status: 201 });
}
