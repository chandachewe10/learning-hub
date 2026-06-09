"use client";

import { useState } from "react";
import { Download, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  certId: string;   // the unique certificateId (used in the URL)
  certTitle: string;
  courseName: string;
}

export function CertificateCardActions({ certId, certTitle, courseName }: Props) {
  const [copied, setCopied] = useState(false);

  const certUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/certificate/${certId}`;

  const handleShare = async () => {
    const url = `/certificate/${certId}`;
    const fullUrl = window.location.origin + url;

    if (navigator.share) {
      await navigator.share({ title: `${certTitle} – ${courseName}`, url: fullUrl });
    } else {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Download → opens the printable certificate page in a new tab */}
      <Link href={`/certificate/${certId}`} target="_blank" className="flex-1">
        <Button size="sm" variant="outline" className="w-full gap-1 text-xs">
          <Download className="w-3.5 h-3.5" /> Download
        </Button>
      </Link>

      <Button
        size="sm"
        variant="outline"
        className="flex-1 gap-1 text-xs"
        onClick={handleShare}
      >
        {copied
          ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
          : <><Share2 className="w-3.5 h-3.5" /> Share</>}
      </Button>
    </div>
  );
}
