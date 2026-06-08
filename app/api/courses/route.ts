import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const sort = searchParams.get("sort") || "newest";
  const price = searchParams.get("price") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const instructorId = searchParams.get("instructorId") || "";
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    }),
    ...(category && { category: { name: { contains: category, mode: "insensitive" } } }),
    ...(level && level !== "ALL" && { level }),
    ...(instructorId && { instructorId }),
    ...(price === "free" && { price: 0, isSubscriptionOnly: false }),
    ...(price === "paid" && { price: { gt: 0 } }),
    ...(price === "subscription" && { isSubscriptionOnly: true }),
  };

  const orderBy: Record<string, unknown> =
    sort === "popular"
      ? { enrollments: { _count: "desc" } }
      : sort === "rating"
      ? { reviews: { _count: "desc" } }
      : sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDesc: true,
        thumbnail: true,
        price: true,
        originalPrice: true,
        currency: true,
        level: true,
        totalDuration: true,
        totalLessons: true,
        isSubscriptionOnly: true,
        instructor: { select: { name: true, image: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const coursesWithRating = courses.map((c) => ({
    ...c,
    avgRating:
      c.reviews.length > 0
        ? c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length
        : 0,
    reviews: undefined,
  }));

  return NextResponse.json({ courses: coursesWithRating, total, page, limit });
}

const createSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  shortDesc: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.number().min(0).default(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("ALL_LEVELS"),
  language: z.string().default("English"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const slug = slugify(data.title) + "-" + Date.now().toString(36);

    const course = await prisma.course.create({
      data: {
        ...data,
        slug,
        instructorId: session.user.id,
        status: "DRAFT",
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
