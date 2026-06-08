"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatPrice } from "@/lib/utils";
import { CreditCard, TrendingUp, Users, Calendar } from "lucide-react";

interface Subscription {
  id: string; plan: string; status: string; amount: number; startDate: string | null;
  endDate: string | null; createdAt: string;
  user: { name: string | null; email: string; image: string | null };
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscriptions").then(r => r.json()).then(d => { setSubs(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const active = subs.filter(s => s.status === "ACTIVE");
  const mrr = active.filter(s => s.plan === "MONTHLY").reduce((acc, s) => acc + s.amount, 0);
  const arr = active.filter(s => s.plan === "YEARLY").reduce((acc, s) => acc + s.amount / 12, 0);

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700", EXPIRED: "bg-slate-100 text-slate-600",
    CANCELLED: "bg-red-100 text-red-600", PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
        <p className="text-slate-500 text-sm">Monitor recurring revenue and subscriber status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Subscribers", value: active.length.toString(), icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Monthly Revenue", value: formatPrice(mrr + arr), icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Monthly Plans", value: active.filter(s => s.plan === "MONTHLY").length.toString(), icon: Calendar, color: "text-blue-600 bg-blue-50" },
          { label: "Yearly Plans", value: active.filter(s => s.plan === "YEARLY").length.toString(), icon: CreditCard, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Subscriber</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subs.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7"><AvatarImage src={s.user.image || ""} /><AvatarFallback className="text-xs">{getInitials(s.user.name || "U")}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-slate-900 text-xs">{s.user.name}</p>
                        <p className="text-xs text-slate-400">{s.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{s.plan}</span></td>
                  <td className="px-4 py-3 font-medium text-green-600">{formatPrice(s.amount)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[s.status] ?? ""}`}>{s.status}</span></td>
                  <td className="px-4 py-3 text-slate-500">{s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {subs.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No subscriptions yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
