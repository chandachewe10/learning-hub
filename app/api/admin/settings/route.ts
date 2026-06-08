import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getSettings() {
  let settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    settings = await prisma.platformSettings.create({ data: {} });
  }
  return settings;
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const settings = await getSettings();
  const updated = await prisma.platformSettings.update({
    where: { id: settings.id },
    data: {
      commissionRate: body.commissionRate !== undefined ? parseFloat(body.commissionRate) : undefined,
      monthlyPrice: body.monthlyPrice !== undefined ? parseFloat(body.monthlyPrice) : undefined,
      yearlyPrice: body.yearlyPrice !== undefined ? parseFloat(body.yearlyPrice) : undefined,
      referralReward: body.referralReward !== undefined ? parseFloat(body.referralReward) : undefined,
      referralRewardType: body.referralRewardType,
      platformName: body.platformName,
    },
  });
  return NextResponse.json(updated);
}
