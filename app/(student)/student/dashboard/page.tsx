import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookOpen, Award, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "@/components/courses/course-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Student Dashboard" };

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [enrollments, certificates, featuredCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            totalLessons: true,
            totalDuration: true,
            instructor: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: 6,
    }),
    prisma.certificate.count({ where: { userId: session.user.id } }),
    prisma.course.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      take: 3,
      select: {
        id: true, title: true, slug: true, shortDesc: true,
        thumbnail: true, price: true, originalPrice: true, currency: true,
        level: true, totalDuration: true, totalLessons: true, isSubscriptionOnly: true,
        instructor: { select: { name: true, image: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    }),
  ]);

  const totalLearningTime = enrollments.reduce((acc, e) => acc + (e.course.totalDuration || 0), 0);
  const completedCourses = enrollments.filter((e) => e.completedAt).length;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Enrolled Courses" value={enrollments.length} icon={BookOpen} iconClassName="bg-indigo-100" />
        <StatsCard title="Completed" value={completedCourses} icon={Award} iconClassName="bg-emerald-100" />
        <StatsCard
          title="Learning Time"
          value={`${Math.round(totalLearningTime / 3600)}h`}
          subtitle="Total hours"
          icon={Clock}
          iconClassName="bg-amber-100"
        />
        <StatsCard title="Certificates" value={certificates} icon={TrendingUp} iconClassName="bg-purple-100" />
      </div>

      {/* Continue learning */}
      {enrollments.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-slate-900">Continue Learning</h2>
            <Link href="/student/my-courses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="divide-y">
            {enrollments.slice(0, 4).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  {enrollment.course.thumbnail ? (
                    <img src={enrollment.course.thumbnail} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{enrollment.course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={enrollment.progressPct} className="h-1.5 flex-1" />
                    <span className="text-xs text-slate-500 shrink-0">{Math.round(enrollment.progressPct)}%</span>
                  </div>
                </div>
                <Link href={`/student/learn/${enrollment.course.id}`}>
                  <Button size="sm" variant="outline" className="shrink-0">Continue</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discover new courses */}
      {featuredCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recommended Courses</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm">Browse all</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {enrollments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Start your learning journey</h3>
          <p className="text-slate-500 text-sm mb-4">Browse thousands of courses and enroll today</p>
          <Link href="/courses">
            <Button variant="gradient">Browse Courses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
