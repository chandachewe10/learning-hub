import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, Star } from "lucide-react";

export const metadata = { title: "Analytics" };

export default async function InstructorAnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      _count: { select: { enrollments: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm">Performance overview for your courses</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-slate-900">Course Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Course</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Students</span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Rating</span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map(course => {
                const avgRating = course.reviews.length > 0
                  ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1)
                  : "—";
                return (
                  <tr key={course.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 line-clamp-1">{course.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        course.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                        course.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{course.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{course._count.enrollments}</td>
                    <td className="px-4 py-3">
                      {avgRating !== "—" ? (
                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                          <Star className="w-3.5 h-3.5 fill-current" />{avgRating}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{course._count.reviews}</td>
                  </tr>
                );
              })}
              {courses.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No courses yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
