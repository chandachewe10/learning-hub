import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initiateMobileMoney, initiateCardPayment, extractPaymentUrl } from "@/lib/lipila";
import { generateReferenceId, formatPhone } from "@/lib/utils";
import { z } from "zod";

const momoSchema = z.object({
  type: z.literal("momo"),
  amount: z.number().positive(),
  phoneNumber: z.string(),
  paymentType: z.enum(["SUBSCRIPTION", "COURSE", "LESSON"]),
  courseId: z.string().optional(),
  subscriptionPlan: z.enum(["MONTHLY", "YEARLY"]).optional(),
  email: z.string().email(),
  name: z.string(),
});

const cardSchema = z.object({
  type: z.literal("card"),
  amount: z.number().positive(),
  phoneNumber: z.string(),
  paymentType: z.enum(["SUBSCRIPTION", "COURSE", "LESSON"]),
  courseId: z.string().optional(),
  subscriptionPlan: z.enum(["MONTHLY", "YEARLY"]).optional(),
  email: z.string().email(),
  name: z.string(),
  city: z.string().default("Lusaka"),
  address: z.string().default("Lusaka, Zambia"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const referenceId = generateReferenceId("lp");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (body.type === "momo") {
      const data = momoSchema.parse(body);
      const formattedPhone = formatPhone(data.phoneNumber);
      const narration = `LearnHub - ${data.paymentType === "SUBSCRIPTION" ? `${data.subscriptionPlan} Subscription` : "Course Purchase"} - ${data.name}`;

      // Save pending payment
      const payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: data.amount,
          currency: "ZMW",
          method: "MOBILE_MONEY",
          type: data.paymentType,
          status: "PENDING",
          referenceId,
          courseId: data.courseId,
          narration,
          phoneNumber: formattedPhone,
        },
      });

      const lipilaRes = await initiateMobileMoney({
        referenceId,
        amount: Math.round(data.amount),
        narration,
        accountNumber: formattedPhone,
        currency: "ZMW",
        email: data.email,
      });

      return NextResponse.json({
        success: true,
        referenceId,
        paymentId: payment.id,
        message: "Payment initiated. Please check your phone to approve the transaction.",
        data: lipilaRes,
      });
    }

    if (body.type === "card") {
      const data = cardSchema.parse(body);
      const formattedPhone = formatPhone(data.phoneNumber);
      const nameParts = data.name.split(" ");
      const redirectUrl = `${appUrl}/payment/success?ref=${referenceId}`;
      const narration = `LearnHub - ${data.paymentType === "SUBSCRIPTION" ? `${data.subscriptionPlan} Subscription` : "Course Purchase"} - ${data.name}`;

      const payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: data.amount,
          currency: "ZMW",
          method: "CARD",
          type: data.paymentType,
          status: "PENDING",
          referenceId,
          courseId: data.courseId,
          narration,
          phoneNumber: formattedPhone,
        },
      });

      const lipilaRes = await initiateCardPayment({
        customerInfo: {
          firstName: nameParts[0] || data.name,
          lastName: nameParts.slice(1).join(" ") || "",
          phoneNumber: formattedPhone,
          city: data.city,
          country: "ZM",
          address: data.address,
          zip: "10101",
          email: data.email,
        },
        collectionRequest: {
          referenceId,
          amount: Math.round(data.amount),
          narration,
          accountNumber: formattedPhone,
          currency: "ZMW",
          backUrl: redirectUrl,
          redirectUrl,
        },
      });

      const paymentUrl = extractPaymentUrl(lipilaRes as Record<string, string>);

      return NextResponse.json({
        success: true,
        referenceId,
        paymentId: payment.id,
        paymentUrl,
        data: lipilaRes,
      });
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error("Payment error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Payment failed. Please try again.",
    }, { status: 500 });
  }
}
