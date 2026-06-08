import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CourseCatalog } from "@/components/courses/course-catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Explore thousands of expert-led courses across web development, data science, design, business, and more.",
};

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">All Courses</h1>
          <p className="text-indigo-100">Discover your next skill with expert-led courses</p>
        </div>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading courses...</div>}>
        <CourseCatalog initialParams={params} categories={categories} />
      </Suspense>
    </div>
  );
}
