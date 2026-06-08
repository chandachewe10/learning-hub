import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Users } from "lucide-react";

export const metadata = { title: "Students" };

export default async function InstructorStudentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    select: { id: true, title: true },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courses.map(c => c.id) } },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      course: { select: { title: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const uniqueStudents = new Map<string, typeof enrollments[0]["user"]>();
  enrollments.forEach(e => uniqueStudents.set(e.user.id, e.user));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <p className="text-slate-500 text-sm">{uniqueStudents.size} unique students across all your courses</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Course</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {enrollments.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={e.user.image || ""} />
                        <AvatarFallback className="text-xs">{getInitials(e.user.name || "S")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{e.user.name}</p>
                        <p className="text-xs text-slate-400">{e.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.course.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${e.progressPct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{e.progressPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No students enrolled yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
