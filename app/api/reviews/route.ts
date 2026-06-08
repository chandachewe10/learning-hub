import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  courseId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId, rating, comment } = schema.parse(body);

  // Must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  const review = await prisma.review.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    create: { userId: session.user.id, courseId, rating, comment },
    update: { rating, comment },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ review }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { courseId },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({ reviews, avgRating: avg, total: reviews.length });
}
