import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Successful!</h1>
          <p className="text-slate-600 mt-2">
            Your payment has been processed. You now have access to your course.
          </p>
          {searchParams.ref && (
            <p className="text-xs text-slate-400 mt-2">
              Reference: {searchParams.ref}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/student/my-courses">
            <Button variant="gradient" className="w-full">Go to My Courses</Button>
          </Link>
          <Link href="/student/dashboard">
            <Button variant="outline" className="w-full">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
