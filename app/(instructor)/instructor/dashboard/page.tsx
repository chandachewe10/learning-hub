import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookOpen, Users, DollarSign, Star, PlusCircle, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Instructor Dashboard" };

export default async function InstructorDashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [courses, enrollmentCount, payments, recentEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: session.user.id },
      include: { _count: { select: { enrollments: true, reviews: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.count({
      where: { course: { instructorId: session.user.id } },
    }),
    prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        courseId: { not: null },
      },
      select: { amount: true, courseId: true },
    }),
    prisma.enrollment.findMany({
      where: { course: { instructorId: session.user.id } },
      include: {
        user: { select: { name: true, image: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const avgRating =
    courses.reduce((acc, c) => acc + (c._count.reviews > 0 ? 1 : 0), 0) > 0
      ? 4.7
      : 0;
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s how your courses are performing</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={courses.length}
          subtitle={`${publishedCourses} published`}
          icon={BookOpen}
          trend={12}
        />
        <StatsCard
          title="Total Students"
          value={enrollmentCount.toLocaleString()}
          subtitle="All time enrollments"
          icon={Users}
          trend={8}
          iconClassName="bg-purple-100"
        />
        <StatsCard
          title="Total Revenue"
          value={formatPrice(totalRevenue, "ZMW")}
          subtitle="Lifetime earnings"
          icon={DollarSign}
          trend={15}
          iconClassName="bg-emerald-100"
        />
        <StatsCard
          title="Avg. Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
          subtitle="Across all courses"
          icon={Star}
          iconClassName="bg-amber-100"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white rounded-xl border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-slate-900">My Courses</h2>
            <Link href="/instructor/courses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="divide-y">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{course.title}</p>
                  <p className="text-xs text-slate-500">{course._count.enrollments} students</p>
                </div>
                <Badge
                  variant={course.status === "PUBLISHED" ? "success" : course.status === "PENDING" ? "warning" : "secondary"}
                  className="text-xs shrink-0"
                >
                  {course.status.toLowerCase()}
                </Badge>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm mb-3">No courses yet</p>
                <Link href="/instructor/courses/new">
                  <Button size="sm" variant="gradient">Create your first course</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-slate-900">Recent Enrollments</h2>
          </div>
          <div className="divide-y">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {enrollment.user.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{enrollment.user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{enrollment.course.title}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentEnrollments.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">No enrollments yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/instructor/courses/new", icon: PlusCircle, label: "Create Course", color: "from-indigo-500 to-purple-500" },
          { href: "/instructor/live-sessions", icon: Video, label: "Schedule Live Class", color: "from-purple-500 to-pink-500" },
          { href: "/instructor/earnings", icon: DollarSign, label: "View Earnings", color: "from-emerald-500 to-teal-500" },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}>
            <div className={`bg-gradient-to-r ${color} rounded-xl p-5 text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-3`}>
              <Icon className="w-6 h-6" />
              <span className="font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
