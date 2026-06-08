import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Users, BookOpen, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, formatDuration, getInitials, truncate } from "@/lib/utils";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    shortDesc?: string | null;
    thumbnail?: string | null;
    price: number;
    originalPrice?: number | null;
    currency: string;
    level: string;
    totalDuration: number;
    totalLessons: number;
    isSubscriptionOnly: boolean;
    instructor: {
      name: string | null;
      image: string | null;
    };
    category?: { name: string } | null;
    _count?: {
      enrollments: number;
      reviews: number;
    };
    avgRating?: number;
  };
  showProgress?: boolean;
  progressPct?: number;
}

export function CourseCard({ course, showProgress, progressPct }: CourseCardProps) {
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-indigo-300" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {course.isSubscriptionOnly && (
              <Badge variant="premium" className="text-xs gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Premium
              </Badge>
            )}
            {course.price === 0 && !course.isSubscriptionOnly && (
              <Badge variant="free" className="text-xs">Free</Badge>
            )}
            {discount >= 20 && (
              <Badge className="bg-red-500 text-white text-xs">{discount}% OFF</Badge>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {course.level.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {course.category && (
            <p className="text-xs font-medium text-indigo-600 mb-1">{course.category.name}</p>
          )}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.shortDesc && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.shortDesc}</p>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-1.5 mb-3">
            <Avatar className="w-5 h-5">
              <AvatarImage src={course.instructor.image || ""} />
              <AvatarFallback className="text-xs">{getInitials(course.instructor.name || "?")}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-600 truncate">{course.instructor.name}</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(course.totalDuration)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.totalLessons} lessons
            </span>
            {course._count?.enrollments !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course._count.enrollments.toLocaleString()}
              </span>
            )}
          </div>

          {/* Rating */}
          {course.avgRating !== undefined && course._count?.reviews !== undefined && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-slate-900">{course.avgRating.toFixed(1)}</span>
              <span className="text-xs text-slate-500">({course._count.reviews})</span>
            </div>
          )}

          {/* Progress bar */}
          {showProgress && progressPct !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            {course.isSubscriptionOnly ? (
              <div className="flex items-center gap-1 text-sm">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 font-semibold text-xs">Subscription</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {course.price === 0 ? "Free" : formatPrice(course.price, course.currency)}
                </span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(course.originalPrice, course.currency)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
