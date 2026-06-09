import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CertificateView } from "@/components/certificates/certificate-view";
import type { Metadata } from "next";

interface Props { params: Promise<{ certId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { certificateId: certId },
    include: { course: { select: { title: true } }, user: { select: { name: true } } },
  });
  if (!cert) return { title: "Certificate Not Found" };
  return { title: `Certificate – ${cert.course.title}` };
}

export default async function CertificatePage({ params }: Props) {
  const { certId } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { certificateId: certId },
    include: {
      user: { select: { name: true } },
      course: {
        select: {
          title: true,
          certTitle: true,
          certBody: true,
          certSignatory: true,
          certSignatoryRole: true,
          certAccentColor: true,
          instructor: { select: { name: true } },
        },
      },
    },
  });

  if (!cert) notFound();

  const accentColor = cert.course.certAccentColor ?? "#6366f1";
  const signatory   = cert.course.certSignatory || cert.course.instructor.name || "Instructor";

  return (
    <CertificateView
      certId={cert.certificateId}
      studentName={cert.user.name ?? "Student"}
      courseName={cert.course.title}
      certTitle={cert.course.certTitle ?? "Certificate of Completion"}
      certBody={
        cert.course.certBody ??
        "This is to certify that the above named student has successfully completed the course and demonstrated outstanding commitment to learning."
      }
      certSignatory={signatory}
      certSignatoryRole={cert.course.certSignatoryRole ?? "Course Instructor"}
      accentColor={accentColor}
      issuedDate={cert.issuedAt.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    />
  );
}
