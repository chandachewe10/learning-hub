import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, body, parentId } = await req.json();
  if (!lessonId || !body?.trim()) {
    return NextResponse.json({ error: "lessonId and body required" }, { status: 400 });
  }

  const discussion = await prisma.discussion.create({
    data: {
      lessonId,
      userId: session.user.id,
      body: body.trim(),
      parentId: parentId || null,
    },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ discussion }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const discussions = await prisma.discussion.findMany({
    where: { lessonId, parentId: null },
    include: {
      user: { select: { name: true, image: true } },
      replies: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ discussions });
}
