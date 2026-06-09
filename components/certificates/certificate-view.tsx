"use client";

import { useRef } from "react";
import { Award, Download, Share2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  certId: string;
  studentName: string;
  courseName: string;
  certTitle: string;
  certBody: string;
  certSignatory: string;
  certSignatoryRole: string;
  accentColor: string;
  issuedDate: string;
}

export function CertificateView(props: Props) {
  const {
    certId, studentName, courseName, certTitle, certBody,
    certSignatory, certSignatoryRole, accentColor, issuedDate,
  } = props;

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${certTitle} – ${courseName}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Certificate link copied to clipboard!");
    }
  };

  return (
    <>
      {/* ── Toolbar (hidden on print) ─────────────────────────── */}
      <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentColor }}>
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">LearnHub</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 text-slate-900 border-white/30 bg-white/10 hover:bg-white/20 text-white"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button onClick={handlePrint} className="gap-2" style={{ background: accentColor }}>
            <Download className="w-4 h-4" /> Download / Print
          </Button>
        </div>
      </div>

      {/* ── Page background ───────────────────────────────────── */}
      <div className="min-h-screen bg-slate-100 flex items-start justify-center py-10 px-4 print:bg-white print:p-0 print:py-0">
        <div ref={printRef} className="w-full max-w-3xl print:max-w-full">

          {/* ═══════════════════════════════════════════════════
              CERTIFICATE CARD — printable area
          ═══════════════════════════════════════════════════ */}
          <div
            id="certificate"
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
            style={{ border: `5px solid ${accentColor}`, fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {/* Top colour bar */}
            <div className="h-4 w-full" style={{ background: accentColor }} />

            {/* Watermark rings */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden
            >
              {[180, 280, 380].map((size) => (
                <div
                  key={size}
                  className="absolute rounded-full opacity-[0.03]"
                  style={{
                    width: size, height: size,
                    background: accentColor,
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </div>

            <div className="relative px-12 py-10 space-y-6 text-center">

              {/* Platform header */}
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: accentColor }}
                >
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold tracking-wide" style={{ color: accentColor }}>LearnHub</p>
                  <p className="text-xs text-slate-400 tracking-widest uppercase">Online Learning Platform</p>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: accentColor + "55" }} />
                <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                <div className="flex-1 h-px" style={{ background: accentColor + "55" }} />
              </div>

              {/* Certificate title */}
              <div>
                <p className="text-4xl font-bold" style={{ color: accentColor }}>{certTitle}</p>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mt-1">of Achievement</p>
              </div>

              {/* Presented to */}
              <div>
                <p className="text-base text-slate-500 mb-1">This is to certify that</p>
                <p
                  className="text-5xl font-light italic text-slate-800"
                  style={{ borderBottom: `2px solid ${accentColor}44`, paddingBottom: "0.5rem", display: "inline-block" }}
                >
                  {studentName}
                </p>
              </div>

              {/* Body text */}
              <p className="text-base text-slate-600 leading-relaxed max-w-xl mx-auto">{certBody}</p>

              {/* Course name */}
              <div
                className="rounded-xl px-6 py-4 mx-auto max-w-lg"
                style={{ background: accentColor + "14", border: `1.5px solid ${accentColor}33` }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Course</p>
                <p className="text-xl font-semibold text-slate-900">{courseName}</p>
              </div>

              {/* Signatures row */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                {/* Instructor */}
                <div className="text-center">
                  <div className="w-32 mx-auto mb-3 italic text-slate-600 text-xl" style={{ borderBottom: `2px solid ${accentColor}` }}>
                    {certSignatory}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{certSignatory}</p>
                  <p className="text-xs text-slate-500">{certSignatoryRole}</p>
                </div>

                {/* Date */}
                <div className="text-center">
                  <div className="w-32 mx-auto mb-3" style={{ borderBottom: `2px solid ${accentColor}` }} />
                  <p className="font-semibold text-slate-800 text-sm">{issuedDate}</p>
                  <p className="text-xs text-slate-500">Date of Issue</p>
                </div>
              </div>

              {/* Verification footer */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <CheckCircle className="w-4 h-4" style={{ color: accentColor }} />
                <p className="text-xs text-slate-400">
                  Certificate ID: <span className="font-mono font-semibold">{certId}</span>
                  &nbsp;·&nbsp;Verify at learnhub.com/certificate/{certId}
                </p>
              </div>
            </div>

            {/* Bottom colour bar */}
            <div className="h-4 w-full" style={{ background: accentColor }} />
          </div>

          {/* ── Below-certificate info (hidden on print) ─────── */}
          <div className="no-print mt-6 text-center text-sm text-slate-500">
            <p>This certificate was issued by LearnHub. To verify its authenticity, visit the URL shown on the certificate.</p>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          #certificate { border-radius: 0 !important; }
        }
      `}</style>
    </>
  );
}
