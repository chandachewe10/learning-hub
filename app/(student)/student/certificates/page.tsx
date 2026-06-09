import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CertificateCardActions } from "@/components/certificates/certificate-card-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const session = await auth();
  if (!session) return null;

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
          thumbnail: true,
          instructor: { select: { name: true } },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        <p className="text-slate-500 text-sm mt-1">
          {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">No certificates yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Complete a course to earn your certificate
          </p>
          <Link href="/courses">
            <Button variant="gradient">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Certificate visual */}
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white text-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <Award className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Certificate of Completion</p>
                <p className="font-bold text-lg leading-snug">{cert.course.title}</p>
                <p className="text-indigo-200 text-sm mt-1">by {cert.course.instructor.name}</p>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Issued on</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(cert.issuedAt).toLocaleDateString("en-ZM", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge className="text-xs font-mono text-slate-500 bg-slate-100">
                    #{cert.certificateId.slice(0, 8).toUpperCase()}
                  </Badge>
                </div>

                <CertificateCardActions
                  certId={cert.certificateId}
                  certTitle="Certificate of Completion"
                  courseName={cert.course.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
