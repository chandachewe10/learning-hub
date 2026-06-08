import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
          thumbnail: true,
          instructor: { select: { name: true } },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ certificates });
}
