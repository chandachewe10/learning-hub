import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(user);
}
