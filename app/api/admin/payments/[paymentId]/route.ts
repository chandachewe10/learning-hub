import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { processPaymentCompletion } from "@/lib/process-payment";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action } = await req.json();

  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.status !== "PENDING") {
    return NextResponse.json(
      { error: `Payment is already ${payment.status.toLowerCase()}` },
      { status: 400 }
    );
  }

  if (action === "confirm") {
    await processPaymentCompletion(payment.id);
    return NextResponse.json({ success: true, status: "COMPLETED" });
  }

  if (action === "fail") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ success: true, status: "FAILED" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
