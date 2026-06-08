import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-2">You don&apos;t have permission to view this page.</p>
        </div>
        <Link href="/">
          <Button variant="gradient" className="w-full">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
