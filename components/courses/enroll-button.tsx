"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payments/payment-modal";
import { Sparkles, BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface EnrollButtonProps {
  courseId: string;
  price: number;
  isSubscriptionOnly: boolean;
}

export function EnrollButton({ courseId, price, isSubscriptionOnly }: EnrollButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (price === 0 && !isSubscriptionOnly) {
      // Free enrollment
      setLoading(true);
      try {
        const res = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        if (res.ok) {
          router.push(`/student/learn/${courseId}`);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setShowPayment(true);
  };

  return (
    <>
      <Button
        onClick={handleEnroll}
        loading={loading}
        className="w-full"
        size="lg"
        variant={isSubscriptionOnly ? "gradient" : "default"}
      >
        {isSubscriptionOnly ? (
          <>
            <Sparkles className="w-4 h-4" />
            Subscribe to Access
          </>
        ) : price === 0 ? (
          <>
            <BookOpen className="w-4 h-4" />
            Enroll for Free
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4" />
            Enroll Now — {formatPrice(price, "ZMW")}
          </>
        )}
      </Button>

      {showPayment && (
        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          type="COURSE"
          courseId={courseId}
          amount={price}
          description="Course Enrollment"
        />
      )}
    </>
  );
}
