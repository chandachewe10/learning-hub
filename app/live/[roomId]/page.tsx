import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JitsiRoom } from "@/components/live/jitsi-room";
import type { Metadata } from "next";

interface Props { params: Promise<{ roomId: string }> }

export const metadata: Metadata = { title: "Live Class" };

export default async function LiveRoomPage({ params }: Props) {
  const { roomId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const liveSession = await prisma.liveSession.findUnique({
    where: { jitsiRoomId: roomId },
    include: {
      instructor: { select: { id: true, name: true } },
      course: { select: { title: true } },
    },
  });

  if (!liveSession) redirect("/student/dashboard");

  return (
    <JitsiRoom
      roomId={roomId}
      sessionTitle={liveSession.title}
      courseTitle={liveSession.course.title}
      userName={session.user.name || "Student"}
      userEmail={session.user.email || ""}
      isModerator={session.user.id === liveSession.instructor.id || session.user.role === "ADMIN"}
    />
  );
}
