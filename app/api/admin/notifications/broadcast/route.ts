import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, message, type, target } = await req.json();
  if (!title || !message) return NextResponse.json({ error: "Title and message required" }, { status: 400 });

  const where = target === "ALL" ? {} : { role: target as "STUDENT" | "INSTRUCTOR" };
  const users = await prisma.user.findMany({ where, select: { id: true } });

  await prisma.notification.createMany({
    data: users.map(u => ({ userId: u.id, title, message, type: type ?? "SYSTEM" })),
  });

  return NextResponse.json({ sent: users.length });
}
