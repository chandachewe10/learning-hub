import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { courses: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, icon } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name, icon: icon || null, slug: slugify(name) },
    include: { _count: { select: { courses: true } } },
  });
  return NextResponse.json(category, { status: 201 });
}
