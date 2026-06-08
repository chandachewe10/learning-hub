import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LearnPageClient } from "@/components/courses/learn-page-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
          instructor: { select: { name: true, image: true } },
        },
      },
      progress: true,
    },
  });

  if (!enrollment) redirect(`/courses`);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      discussions: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, image: true } },
          replies: {
            include: { user: { select: { name: true, image: true } } },
          },
        },
      },
    },
  });

  if (!lesson) notFound();

  return (
    <LearnPageClient
      enrollment={enrollment}
      currentLesson={lesson}
      userId={session.user.id}
      userName={session.user.name || ""}
      userImage={session.user.image || ""}
    />
  );
}
