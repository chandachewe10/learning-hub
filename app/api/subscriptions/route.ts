import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SUBSCRIPTION_PRICES = {
  MONTHLY: 299,
  YEARLY: 2388,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !["MONTHLY", "YEARLY"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Check active subscription
  const existing = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "You already have an active subscription", subscription: existing }, { status: 400 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan,
      status: "PENDING",
      amount: SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES],
      currency: "ZMW",
    },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscription });
}
