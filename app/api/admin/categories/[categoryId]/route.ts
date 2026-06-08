import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { categoryId } = await params;
  const { name, icon } = await req.json();
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: { name, icon: icon || null },
    include: { _count: { select: { courses: true } } },
  });
  return NextResponse.json(category);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { categoryId } = await params;
  await prisma.category.delete({ where: { id: categoryId } });
  return NextResponse.json({ success: true });
}
