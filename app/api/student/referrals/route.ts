import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, referralCode: true },
  });

  if (!user?.referralCode) {
    user = await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: nanoid(8).toUpperCase() },
      select: { id: true, referralCode: true },
    });
  }

  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    include: { referred: { select: { name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  const settings = await prisma.platformSettings.findFirst();
  const totalEarned = referrals.filter(r => r.isPaid).reduce((s, r) => s + (r.reward ?? 0), 0);
  const pendingPayout = referrals.filter(r => !r.isPaid).reduce((s, r) => s + (r.reward ?? settings?.referralReward ?? 0), 0);

  return NextResponse.json({ referralCode: user?.referralCode, referrals, totalEarned, pendingPayout, settings });
}
