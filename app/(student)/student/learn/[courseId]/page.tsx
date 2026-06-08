import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ courseId: string }> }

export default async function LearnCoursePage({ params }: Props) {
  const { courseId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) redirect("/courses");

  // Find first lesson
  const firstSection = await prisma.section.findFirst({
    where: { courseId },
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (firstSection?.lessons[0]) {
    redirect(`/student/learn/${courseId}/${firstSection.lessons[0].id}`);
  }

  redirect("/student/dashboard");
}
