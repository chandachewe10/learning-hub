import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 30;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: status ? { status: status as "PENDING" | "COMPLETED" | "FAILED" } : undefined,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({
      where: status ? { status: status as "PENDING" | "COMPLETED" | "FAILED" } : undefined,
    }),
  ]);

  return NextResponse.json({ payments, total, page, limit });
}
