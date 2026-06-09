import { prisma } from "@/lib/prisma";
import { sendEnrollmentEmail, sendPaymentReceiptEmail } from "@/lib/email";

/**
 * Handles all side-effects when a payment transitions to COMPLETED.
 * Called by both the Lipila webhook and the admin manual-confirm action.
 */
export async function processPaymentCompletion(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true, subscription: true },
  });

  if (!payment || payment.status !== "PENDING") return;

  // Mark payment completed
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "COMPLETED" },
  });

  // ── Subscription activation ──────────────────────────────────────────────
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

  // ── Course enrollment ────────────────────────────────────────────────────
  if (payment.type === "COURSE" && payment.courseId) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      create: { userId: payment.userId, courseId: payment.courseId },
      update: { enrolledAt: new Date() },
    });

    const course = await prisma.course.findUnique({
      where: { id: payment.courseId },
      select: { title: true },
    });

    if (course && payment.user.email) {
      const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/student/learn/${payment.courseId}`;
      sendEnrollmentEmail(
        payment.user.email,
        payment.user.name ?? "Student",
        course.title,
        courseUrl
      ).catch(console.error);
    }
  }

  // ── Referral reward (first purchase only) ───────────────────────────────
  const referral = await prisma.referral.findFirst({
    where: { referredId: payment.userId, reward: null },
  });

  if (referral) {
    const settings = await prisma.platformSettings.findFirst();
    const rewardAmount =
      settings?.referralRewardType === "PERCENT"
        ? (payment.amount * (settings.referralReward ?? 50)) / 100
        : (settings?.referralReward ?? 50);

    await prisma.referral.update({
      where: { id: referral.id },
      data: { reward: rewardAmount },
    });

    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        title: "Referral Reward Earned!",
        message: `You earned ${payment.currency} ${rewardAmount.toFixed(2)} — someone you referred just made a purchase.`,
        type: "PAYMENT",
        link: "/student/referrals",
      },
    });
  }

  // ── Payment receipt email ────────────────────────────────────────────────
  if (payment.user.email) {
    sendPaymentReceiptEmail(
      payment.user.email,
      payment.user.name ?? "Student",
      payment.amount,
      payment.currency,
      payment.referenceId,
      payment.narration ?? "LearnHub Purchase"
    ).catch(console.error);
  }

  // ── In-app notification for buyer ───────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: payment.userId,
      title: "Payment Confirmed",
      message: `Your payment of ${payment.currency} ${payment.amount} has been confirmed. You now have access.`,
      type: "PAYMENT",
      link: payment.type === "COURSE" && payment.courseId
        ? `/student/learn/${payment.courseId}`
        : "/student/dashboard",
    },
  });
}
