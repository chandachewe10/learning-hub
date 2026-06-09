import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processPaymentCompletion } from "@/lib/process-payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const referenceId = body.referenceId || body.reference_id || body.transactionId;

    if (!referenceId) {
      return NextResponse.json({ error: "Missing referenceId" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { referenceId } });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const status =
      body.status === "SUCCESSFUL" || body.status === "SUCCESS" || body.status === "COMPLETED"
        ? "COMPLETED"
        : body.status === "FAILED" || body.status === "CANCELLED"
        ? "FAILED"
        : null;

    if (!status || payment.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    if (status === "FAILED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", lipilaTxRef: body.transactionId || body.lipilaTransactionId },
      });
      return NextResponse.json({ received: true, status });
    }

    // Store Lipila tx ref before delegating to shared handler
    await prisma.payment.update({
      where: { id: payment.id },
      data: { lipilaTxRef: body.transactionId || body.lipilaTransactionId },
    });

    await processPaymentCompletion(payment.id);

    return NextResponse.json({ received: true, status });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
