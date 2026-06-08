import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { BookOpen, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

export const metadata = { title: "All Courses" };

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { name: true, email: true } },
      _count: { select: { enrollments: true, lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Courses</h1>
          <p className="text-slate-500 text-sm">{courses.length} total courses on the platform</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Course</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Instructor</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Students</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" className="w-10 h-7 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-7 rounded bg-indigo-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-slate-400">{course._count.lessons} lessons</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{course.instructor.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[course.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {course.price === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(course.price)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{course._count.enrollments}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                      </Link>
                      {course.status === "PENDING" && (
                        <>
                          <form action={async () => {
                            "use server";
                            await prisma.course.update({ where: { id: course.id }, data: { status: "PUBLISHED" } });
                          }}>
                            <button type="submit" className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </form>
                          <form action={async () => {
                            "use server";
                            await prisma.course.update({ where: { id: course.id }, data: { status: "DRAFT" } });
                          }}>
                            <button type="submit" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      )}
                      {course.status === "PUBLISHED" && (
                        <form action={async () => {
                          "use server";
                          await prisma.course.update({ where: { id: course.id }, data: { status: "ARCHIVED" } });
                        }}>
                          <button type="submit" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Archive">
                            <Clock className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No courses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
