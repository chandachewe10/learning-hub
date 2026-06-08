import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ couponId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { couponId } = await params;
  await prisma.coupon.delete({ where: { id: couponId } });
  return NextResponse.json({ success: true });
}
