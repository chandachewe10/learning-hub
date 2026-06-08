"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, DollarSign, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface ReferralData {
  referralCode: string; totalEarned: number; pendingPayout: number;
  settings: { referralReward: number; referralRewardType: string };
  referrals: { id: string; isPaid: boolean; createdAt: string; reward: number | null; referred: { name: string | null; email: string; createdAt: string } }[];
}

export default function StudentReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/student/referrals").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const referralUrl = typeof window !== "undefined" && data?.referralCode
    ? `${window.location.origin}/register?ref=${data.referralCode}`
    : "";

  const copyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
        <p className="text-slate-500 text-sm">Invite friends and earn rewards for every signup</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: data?.referrals.length.toString() ?? "0", icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Earned", value: formatPrice(data?.totalEarned ?? 0), icon: DollarSign, color: "text-green-600 bg-green-50" },
          { label: "Pending Payout", value: formatPrice(data?.pendingPayout ?? 0), icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "Reward Per Ref", value: data?.settings?.referralRewardType === "PERCENT" ? `${data.settings.referralReward}%` : formatPrice(data?.settings?.referralReward ?? 50), icon: Gift, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}><Icon className="w-4 h-4" /></div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5" />
          <h2 className="font-semibold">Your Referral Link</h2>
        </div>
        <p className="text-indigo-200 text-sm mb-4">
          Share this link. When someone signs up and makes a purchase, you earn{" "}
          <strong className="text-white">{data?.settings?.referralRewardType === "PERCENT" ? `${data.settings.referralReward}%` : formatPrice(data?.settings?.referralReward ?? 50)}</strong>!
        </p>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <p className="flex-1 text-sm font-mono text-white truncate">{referralUrl}</p>
          <Button onClick={copyLink} size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50 shrink-0">
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </Button>
        </div>
        <p className="text-indigo-200 text-xs mt-3">Your code: <strong className="text-white font-mono">{data?.referralCode}</strong></p>
      </div>

      {/* Referral history */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-slate-900">Referral History</h2>
        </div>
        {data?.referrals.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Referred User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Reward</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.referrals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.referred.name ?? "User"}</p>
                    <p className="text-xs text-slate-400">{r.referred.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-green-600">{r.reward ? formatPrice(r.reward) : <span className="text-slate-400">Pending purchase</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
