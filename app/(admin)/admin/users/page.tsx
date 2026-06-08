import { prisma } from "@/lib/prisma";
import { AdminUsersClient } from "@/components/dashboard/admin-users-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const params = await searchParams;
  const role = params.role as "STUDENT" | "INSTRUCTOR" | "ADMIN" | undefined;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, role: true, isApproved: true,
        isActive: true, createdAt: true, image: true,
        _count: { select: { courses: true, enrollments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return <AdminUsersClient users={users} total={total} page={page} />;
}
