import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { BookOpen, Plus, Pencil, Users, Eye } from "lucide-react";

export const metadata = { title: "My Courses" };

export default async function InstructorCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: { _count: { select: { enrollments: true, sections: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    PENDING: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500 text-sm">{courses.length} course{courses.length !== 1 ? "s" : ""} created</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button variant="gradient"><Plus className="w-4 h-4" /> New Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first course and start earning</p>
          <Link href="/instructor/courses/new">
            <Button variant="gradient"><Plus className="w-4 h-4" /> Create First Course</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border p-5 flex items-center gap-5 hover:shadow-sm transition-shadow">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="w-24 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-24 h-16 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColor[course.status]}`}>{course.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course._count.enrollments} students</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course._count.sections} sections</span>
                  <span>{course.price === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(course.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {course.status === "PUBLISHED" && (
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5" /> Preview</Button>
                  </Link>
                )}
                <Link href={`/instructor/courses/${course.id}/edit`}>
                  <Button variant="gradient" size="sm"><Pencil className="w-3.5 h-3.5" /> Edit</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
