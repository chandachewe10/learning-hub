import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, CheckCircle, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session) return null;

  const enrollments = await prisma.enrollment.findMany({
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
          level: true,
          instructor: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: [
      { lastAccessedAt: { sort: "desc", nulls: "last" } },
      { enrolledAt: "desc" },
    ],
  });

  const completed = enrollments.filter((e) => e.completedAt);
  const inProgress = enrollments.filter((e) => !e.completedAt && e.progressPct > 0);
  const notStarted = enrollments.filter((e) => !e.completedAt && e.progressPct === 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500 text-sm">{enrollments.length} enrolled courses</p>
        </div>
        <Link href="/courses">
          <Button variant="gradient" className="gap-2">
            <BookOpen className="w-4 h-4" /> Browse More
          </Button>
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 text-sm mb-4">Start learning by enrolling in a course</p>
          <Link href="/courses"><Button variant="gradient">Find Courses</Button></Link>
        </div>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <CourseSection title="In Progress" courses={inProgress} />
          )}
          {notStarted.length > 0 && (
            <CourseSection title="Not Started" courses={notStarted} />
          )}
          {completed.length > 0 && (
            <CourseSection title="Completed" courses={completed} showCertificate />
          )}
        </div>
      )}
    </div>
  );
}

function CourseSection({
  title,
  courses,
  showCertificate = false,
}: {
  title: string;
  courses: Array<{
    id: string;
    progressPct: number;
    completedAt: Date | null;
    lastAccessedAt: Date | null;
    course: {
      id: string;
      title: string;
      slug: string;
      thumbnail: string | null;
      totalLessons: number;
      totalDuration: number;
      level: string;
      instructor: { name: string | null };
      category: { name: string } | null;
    };
  }>;
  showCertificate?: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {showCertificate ? (
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : (
          <Clock className="w-5 h-5 text-indigo-500" />
        )}
        {title} <span className="text-slate-400 font-normal text-sm">({courses.length})</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((enrollment) => (
          <div key={enrollment.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              {enrollment.course.thumbnail ? (
                <img
                  src={enrollment.course.thumbnail}
                  alt={enrollment.course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
              )}
              {enrollment.completedAt && (
                <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              {enrollment.course.category && (
                <p className="text-xs text-indigo-600 font-medium">{enrollment.course.category.name}</p>
              )}
              <h3 className="font-semibold text-sm text-slate-900 line-clamp-2">{enrollment.course.title}</h3>
              <p className="text-xs text-slate-500">{enrollment.course.instructor.name}</p>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{Math.round(enrollment.progressPct)}% complete</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(enrollment.course.totalDuration)}
                  </span>
                </div>
                <Progress value={enrollment.progressPct} className="h-1.5" />
              </div>

              <div className="flex gap-2">
                <Link href={`/student/learn/${enrollment.course.id}`} className="flex-1">
                  <Button size="sm" variant={enrollment.completedAt ? "outline" : "gradient"} className="w-full gap-1 text-xs">
                    <PlayCircle className="w-3.5 h-3.5" />
                    {enrollment.completedAt ? "Review" : enrollment.progressPct > 0 ? "Continue" : "Start"}
                  </Button>
                </Link>
                {enrollment.completedAt && showCertificate && (
                  <Link href="/student/certificates">
                    <Button size="sm" variant="outline" className="gap-1 text-xs text-emerald-600 border-emerald-200">
                      Certificate
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
