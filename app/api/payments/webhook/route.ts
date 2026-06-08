import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceiptEmail, sendEnrollmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const referenceId = body.referenceId || body.reference_id || body.transactionId;

    if (!referenceId) {
      return NextResponse.json({ error: "Missing referenceId" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { referenceId },
      include: { user: true, subscription: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Determine status from Lipila webhook payload
    const status = body.status === "SUCCESSFUL" || body.status === "SUCCESS" || body.status === "COMPLETED"
      ? "COMPLETED"
      : body.status === "FAILED" || body.status === "CANCELLED"
      ? "FAILED"
      : null;

    if (!status || payment.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        lipilaTxRef: body.transactionId || body.lipilaTransactionId,
      },
    });

    if (status === "COMPLETED") {
      // Handle subscription
      if (payment.type === "SUBSCRIPTION" && payment.subscriptionId) {
        const now = new Date();
        const endDate = new Date(now);
        if (payment.subscription?.plan === "MONTHLY") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "ACTIVE", startDate: now, endDate },
        });
      }

      // Handle course enrollment
      if (payment.type === "COURSE" && payment.courseId) {
        await prisma.enrollment.upsert({
          where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
          create: { userId: payment.userId, courseId: payment.courseId },
          update: { enrolledAt: new Date() },
        });

        const course = await prisma.course.findUnique({
          where: { id: payment.courseId },
          select: { title: true, slug: true },
        });

        if (course && payment.user.email) {
          const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/student/learn/${payment.courseId}`;
          sendEnrollmentEmail(payment.user.email, payment.user.name!, course.title, courseUrl).catch(console.error);
        }
      }

      // Send receipt
      if (payment.user.email) {
        sendPaymentReceiptEmail(
          payment.user.email,
          payment.user.name!,
          payment.amount,
          payment.currency,
          payment.referenceId,
          payment.narration || "LearnHub Purchase"
        ).catch(console.error);
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: "Payment Successful",
          message: `Your payment of ${payment.currency} ${payment.amount} has been confirmed.`,
          type: "PAYMENT",
          link: "/student/dashboard",
        },
      });
    }

    return NextResponse.json({ received: true, status });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
