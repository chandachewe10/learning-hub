import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";
import { nanoid } from "nanoid";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const referralCode = nanoid(8).toUpperCase();

    let referredById: string | null = null;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referralCode } });
      if (referrer) referredById = referrer.id;
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        referralCode,
        referredBy: referredById,
        isApproved: data.role === "STUDENT",
      },
    });

    // Create referral record
    if (referredById) {
      await prisma.referral.create({
        data: { referrerId: referredById, referredId: user.id },
      });
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email!, user.name!).catch(console.error);

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data.", details: error.issues }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
