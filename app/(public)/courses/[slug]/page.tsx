import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  Star, Clock, Users, BookOpen, Globe, Award, PlayCircle,
  FileText, Lock, CheckCircle, ChevronDown, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { EnrollButton } from "@/components/courses/enroll-button";
import { formatPrice, formatDuration, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, shortDesc: true, thumbnail: true },
  });
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.shortDesc || undefined,
    openGraph: { images: course.thumbnail ? [course.thumbnail] : [] },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      instructor: {
        select: { id: true, name: true, image: true, bio: true, _count: { select: { courses: true } } },
      },
      category: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });

  if (!course) notFound();

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
      : 0;

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const freeLessons = course.sections
    .flatMap((s) => s.lessons)
    .filter((l) => l.isFree)
    .slice(0, 3);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Course hero */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {course.category && (
                <Link href={`/courses?category=${course.category.name}`}>
                  <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-500/40">
                    {course.category.name}
                  </Badge>
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{course.title}</h1>
              {course.shortDesc && <p className="text-indigo-100 text-lg">{course.shortDesc}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{avgRating.toFixed(1)}</span>
                    <span className="text-indigo-200">({course._count.reviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-indigo-200">
                  <Users className="w-4 h-4" />
                  {course._count.enrollments.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1 text-indigo-200">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </div>
                <div className="flex items-center gap-1 text-indigo-200">
                  <Clock className="w-4 h-4" />
                  {formatDuration(course.totalDuration)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={course.instructor.image || ""} />
                  <AvatarFallback className="text-xs">{getInitials(course.instructor.name || "I")}</AvatarFallback>
                </Avatar>
                <span className="text-indigo-200 text-sm">
                  Created by{" "}
                  <span className="text-white font-medium">{course.instructor.name}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {course.level.replace("_", " ").toLowerCase()}
                </Badge>
                <Badge variant="secondary">{totalLessons} lessons</Badge>
                {course.isSubscriptionOnly && <Badge variant="premium">Subscription Only</Badge>}
              </div>
            </div>

            {/* Sticky purchase card (mobile: below hero) */}
            <div className="lg:hidden">
              <PurchaseCard course={course} enrollment={enrollment} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.objectives.length > 0 && (
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">What You&apos;ll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {obj}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Preview video */}
            {course.previewVideo && freeLessons.length === 0 && (
              <section className="bg-white rounded-xl border overflow-hidden">
                <div className="aspect-video bg-slate-900 relative">
                  <video src={course.previewVideo} controls className="w-full h-full" />
                </div>
              </section>
            )}

            {/* Curriculum */}
            <section className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Course Curriculum</h2>
                <span className="text-sm text-slate-500">{totalLessons} lessons</span>
              </div>
              <div className="space-y-3">
                {course.sections.map((section) => (
                  <details key={section.id} className="border rounded-xl overflow-hidden group" open>
                    <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-900">{section.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{section.lessons.length} lessons</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                      </div>
                    </summary>
                    <div className="divide-y">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                          {lesson.type === "VIDEO" ? (
                            <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                          ) : lesson.type === "DOCUMENT" ? (
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          ) : (
                            <Video className="w-4 h-4 text-purple-500 shrink-0" />
                          )}
                          <span className="text-sm text-slate-700 flex-1">{lesson.title}</span>
                          <div className="flex items-center gap-2">
                            {lesson.duration && (
                              <span className="text-xs text-slate-400">{Math.floor(lesson.duration / 60)}m</span>
                            )}
                            {lesson.isFree ? (
                              <Badge variant="free" className="text-xs">Preview</Badge>
                            ) : !enrollment ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Requirements */}
            {course.requirements.length > 0 && (
              <section className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Instructor */}
            <section className="bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About the Instructor</h2>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={course.instructor.image || ""} />
                  <AvatarFallback className="text-xl">{getInitials(course.instructor.name || "I")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{course.instructor.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{course.instructor._count.courses} courses</p>
                  {course.instructor.bio && (
                    <p className="text-sm text-slate-700 leading-relaxed">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Reviews */}
            {course.reviews.length > 0 && (
              <section className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                    <span className="text-slate-500 text-sm">({course._count.reviews})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b last:border-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={review.user.image || ""} />
                          <AvatarFallback className="text-xs">{getInitials(review.user.name || "U")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-slate-900">{review.user.name}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-700 mt-1">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sticky purchase card (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <PurchaseCard course={course} enrollment={enrollment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({
  course,
  enrollment,
}: {
  course: Awaited<ReturnType<typeof prisma.course.findUnique>> & {
    _count: { enrollments: number; reviews: number };
    sections: Array<{ lessons: Array<unknown> }>;
  };
  enrollment: { id: string } | null;
}) {
  if (!course) return null;
  const totalLessons = course.sections.reduce((acc: number, s: { lessons: Array<unknown> }) => acc + s.lessons.length, 0);

  return (
    <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
      {course.previewVideo && (
        <div className="aspect-video bg-slate-900 relative">
          <video src={course.previewVideo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        {!enrollment ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {course.price === 0 ? "Free" : formatPrice(course.price, course.currency)}
              </span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="text-slate-400 line-through text-lg">
                  {formatPrice(course.originalPrice, course.currency)}
                </span>
              )}
            </div>
            {course.isSubscriptionOnly && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                This course is included with a LearnHub subscription.
              </p>
            )}
            <EnrollButton courseId={course.id} price={course.price} isSubscriptionOnly={course.isSubscriptionOnly} />
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-lg px-4 py-3 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              You&apos;re enrolled in this course
            </div>
            <Link href={`/student/learn/${course.id}`}>
              <Button className="w-full" variant="gradient">Continue Learning</Button>
            </Link>
          </div>
        )}

        <div className="space-y-2 text-sm text-slate-700 pt-2 border-t">
          <p className="font-semibold text-slate-900">This course includes:</p>
          {course.totalDuration > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              {formatDuration(course.totalDuration)} of video content
            </div>
          )}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            {totalLessons} lessons
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            {course.language}
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" />
            Certificate of completion
          </div>
        </div>
      </div>
    </div>
  );
}
