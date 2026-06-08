import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LiveSessionsClient } from "@/components/live/live-sessions-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Live Sessions" };

export default async function LiveSessionsPage() {
  const session = await auth();
  if (!session) return null;

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id, status: "PUBLISHED" },
    select: { id: true, title: true },
  });

  const liveSessions = await prisma.liveSession.findMany({
    where: { instructorId: session.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { scheduledAt: "desc" },
  });

  return <LiveSessionsClient courses={courses} sessions={liveSessions} />;
}
