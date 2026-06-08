import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const [
    monthlyEnrollments,
    monthlyRevenue,
    topCourses,
    userGrowth,
  ] = await Promise.all([
    // Enrollments over last 6 months
    prisma.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT TO_CHAR("enrolledAt", 'Mon YY') as month, COUNT(*) as count
      FROM enrollments
      WHERE "enrolledAt" > NOW() - INTERVAL '6 months'
      GROUP BY month, DATE_TRUNC('month', "enrolledAt")
      ORDER BY DATE_TRUNC('month', "enrolledAt")
    `,
    // Revenue over last 6 months
    prisma.$queryRaw<Array<{ month: string; total: number }>>`
      SELECT TO_CHAR("createdAt", 'Mon YY') as month, SUM(amount) as total
      FROM payments
      WHERE status = 'COMPLETED' AND "createdAt" > NOW() - INTERVAL '6 months'
      GROUP BY month, DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
    // Top 5 courses by enrollment
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
    // User registrations over last 6 months
    prisma.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT TO_CHAR("createdAt", 'Mon YY') as month, COUNT(*) as count
      FROM users
      WHERE "createdAt" > NOW() - INTERVAL '6 months'
      GROUP BY month, DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
  ]);

  return (
    <AnalyticsClient
      monthlyEnrollments={monthlyEnrollments}
      monthlyRevenue={monthlyRevenue}
      topCourses={topCourses.map((c) => ({ name: c.title, enrollments: c._count.enrollments }))}
      userGrowth={userGrowth}
    />
  );
}
