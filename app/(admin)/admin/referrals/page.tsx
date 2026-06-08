"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface Referral {
  id: string; reward: number | null; isPaid: boolean; createdAt: string;
  referrer: { name: string | null; email: string };
  referred: { name: string | null; email: string };
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/referrals").then(r => r.json()).then(d => { setReferrals(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const markPaid = async (id: string) => {
    setPaying(id);
    await fetch("/api/admin/referrals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReferrals(r => r.map(x => x.id === id ? { ...x, isPaid: true } : x));
    setPaying(null);
  };

  const totalPaid = referrals.filter(r => r.isPaid).reduce((s, r) => s + (r.reward ?? 0), 0);
  const totalPending = referrals.filter(r => !r.isPaid).reduce((s, r) => s + (r.reward ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
        <p className="text-slate-500 text-sm">Track and pay out referral rewards to users</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: referrals.length.toString(), icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Paid Out", value: referrals.filter(r => r.isPaid).length.toString(), icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Total Paid (ZMW)", value: formatPrice(totalPaid), icon: DollarSign, color: "text-blue-600 bg-blue-50" },
          { label: "Pending Payout", value: formatPrice(totalPending), icon: Clock, color: "text-yellow-600 bg-yellow-50" },
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Referrer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Referred User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Reward</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {referrals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.referrer.name}</p>
                    <p className="text-xs text-slate-400">{r.referrer.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.referred.name}</p>
                    <p className="text-xs text-slate-400">{r.referred.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-green-600">{r.reward ? formatPrice(r.reward) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {!r.isPaid && (
                      <Button size="sm" variant="outline" loading={paying === r.id} onClick={() => markPaid(r.id)}>
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {referrals.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No referrals yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
