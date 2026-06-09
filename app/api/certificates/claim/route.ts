import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/certificates/claim
 * Body: { enrollmentId }
 *
 * Issues a certificate for the given enrollment if:
 *  - The user is authenticated and owns the enrollment
 *  - The course has hasCertificate = true
 *  - The enrollment progress is 100%
 *
 * Idempotent: calling multiple times returns the same certificate.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enrollmentId } = await req.json();
  if (!enrollmentId) {
    return NextResponse.json({ error: "Missing enrollmentId" }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          hasCertificate: true,
          instructorId: true,
        },
      },
    },
  });

  if (!enrollment || enrollment.userId !== session.user.id) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  if (!enrollment.course.hasCertificate) {
    return NextResponse.json({ error: "This course does not award certificates" }, { status: 400 });
  }

  if (enrollment.progressPct < 100) {
    return NextResponse.json({ error: "Course not yet completed" }, { status: 400 });
  }

  // Idempotent — return existing certificate if already issued
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: enrollment.courseId } },
  });
  if (existing) {
    return NextResponse.json({ certificateId: existing.certificateId });
  }

  // Issue new certificate
  const cert = await prisma.certificate.create({
    data: {
      userId: session.user.id,
      courseId: enrollment.courseId,
    },
  });

  // Mark enrollment as completed if not already
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: enrollment.completedAt ?? new Date() },
  });

  // In-app notification for the student
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: "CERTIFICATE",
      title: "Certificate Issued 🎓",
      message: `Congratulations! Your certificate for "${enrollment.course.title}" is ready.`,
      link: `/certificate/${cert.certificateId}`,
    },
  });

  return NextResponse.json({ certificateId: cert.certificateId });
}
