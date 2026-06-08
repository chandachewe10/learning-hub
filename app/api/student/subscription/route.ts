import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
  });
  const settings = await prisma.platformSettings.findFirst();
  return NextResponse.json({ subscription, settings });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, phoneNumber } = await req.json();
  const settings = await prisma.platformSettings.findFirst();
  if (!settings) return NextResponse.json({ error: "Settings not found" }, { status: 500 });

  const amount = plan === "YEARLY" ? settings.yearlyPrice : settings.monthlyPrice;
  const endDate = new Date();
  if (plan === "YEARLY") endDate.setFullYear(endDate.getFullYear() + 1);
  else endDate.setMonth(endDate.getMonth() + 1);

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan,
      status: "PENDING",
      amount,
      startDate: new Date(),
      endDate,
    },
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount,
      type: "SUBSCRIPTION",
      status: "PENDING",
      method: "MOBILE_MONEY",
      referenceId: nanoid(),
      subscriptionId: subscription.id,
      phoneNumber,
      narration: `${plan} Subscription`,
    },
  });

  return NextResponse.json({ subscription });
}
