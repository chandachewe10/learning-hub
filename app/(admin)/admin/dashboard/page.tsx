import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, BookOpen, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [
    userCount, instructorCount, courseCount, pendingCourses,
    enrollmentCount, payments, recentUsers, recentCourses
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.course.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count(),
    prisma.payment.findMany({ where: { status: "COMPLETED" }, select: { amount: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, isApproved: true },
    }),
    prisma.course.findMany({
      where: { status: "PENDING" },
      include: { instructor: { select: { name: true } } },
      take: 5,
    }),
  ]);

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={userCount.toLocaleString()} icon={Users} trend={12} iconClassName="bg-indigo-100" />
        <StatsCard title="Instructors" value={instructorCount} subtitle={`${instructorCount} active`} icon={TrendingUp} iconClassName="bg-purple-100" />
        <StatsCard title="Published Courses" value={courseCount} subtitle={`${pendingCourses} pending review`} icon={BookOpen} iconClassName="bg-amber-100" />
        <StatsCard title="Total Revenue" value={formatPrice(totalRevenue, "ZMW")} icon={DollarSign} trend={18} iconClassName="bg-emerald-100" />
      </div>

      {/* Alerts */}
      {pendingCourses > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-medium text-sm">
              {pendingCourses} course{pendingCourses !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
          <Link href="/admin/courses?status=PENDING">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Review Now</Button>
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending course approvals */}
        <div className="bg-white rounded-xl border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-slate-900">Pending Course Reviews</h2>
            <Link href="/admin/courses"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          <div className="divide-y">
            {recentCourses.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No pending courses</div>
            ) : (
              recentCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{course.title}</p>
                    <p className="text-xs text-slate-500">by {course.instructor.name}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <ApproveButton courseId={course.id} action="approve" />
                    <ApproveButton courseId={course.id} action="reject" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-xl border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-slate-900">Recent Users</h2>
            <Link href="/admin/users"><Button variant="ghost" size="sm">View all</Button></Link>
          </div>
          <div className="divide-y">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge
                    variant={user.role === "INSTRUCTOR" ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                  {user.role === "INSTRUCTOR" && !user.isApproved && (
                    <Badge variant="warning" className="text-xs">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/admin/users", label: "Manage Users", icon: Users, color: "from-indigo-500 to-blue-500" },
          { href: "/admin/courses", label: "Review Courses", icon: BookOpen, color: "from-purple-500 to-violet-500" },
          { href: "/admin/payments", label: "View Payments", icon: DollarSign, color: "from-emerald-500 to-teal-500" },
          { href: "/admin/analytics", label: "Analytics", icon: TrendingUp, color: "from-amber-500 to-orange-500" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className={`bg-gradient-to-r ${color} rounded-xl p-5 text-white hover:opacity-90 transition-opacity flex items-center gap-3 cursor-pointer`}>
              <Icon className="w-6 h-6" />
              <span className="font-medium text-sm">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ApproveButton({ courseId, action }: { courseId: string; action: "approve" | "reject" }) {
  return (
    <form action={`/api/admin/courses/${courseId}/${action}`} method="POST">
      <Button
        type="submit"
        size="sm"
        variant={action === "approve" ? "default" : "outline"}
        className={action === "reject" ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
      >
        {action === "approve" ? (
          <><CheckCircle className="w-3 h-3 mr-1" />Approve</>
        ) : (
          <>Reject</>
        )}
      </Button>
    </form>
  );
}
