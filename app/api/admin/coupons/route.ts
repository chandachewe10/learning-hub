import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { code, type, discount, maxUses, expiresAt } = await req.json();
  const coupon = await prisma.coupon.create({
    data: { code, type, discount, maxUses: maxUses ?? null, expiresAt: expiresAt ? new Date(expiresAt) : null },
  });
  return NextResponse.json(coupon, { status: 201 });
}
