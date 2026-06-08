import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendInstructorApprovalEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const body = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: body,
  });

  // Send approval email to instructors
  if (body.isApproved !== undefined && user.role === "INSTRUCTOR" && user.email) {
    sendInstructorApprovalEmail(user.email, user.name!, body.isApproved).catch(console.error);
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
