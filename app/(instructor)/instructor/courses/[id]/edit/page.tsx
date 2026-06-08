import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseEditorClient } from "@/components/courses/course-editor-client";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Edit Course" };

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      category: true,
    },
  });

  if (!course || (course.instructorId !== session.user.id && session.user.role !== "ADMIN")) {
    notFound();
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return <CourseEditorClient course={course} categories={categories} />;
}
