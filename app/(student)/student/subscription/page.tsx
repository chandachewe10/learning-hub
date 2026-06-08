"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Zap, Crown, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

interface Settings { monthlyPrice: number; yearlyPrice: number; currency: string }
interface Subscription { id: string; plan: string; status: string; endDate: string | null; amount: number }

const perks = [
  "Unlimited access to all courses",
  "Download resources & materials",
  "Priority support",
  "Certificates of completion",
  "Early access to new courses",
  "Live session recordings",
];

export default function StudentSubscriptionPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [phone, setPhone] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/student/subscription").then(r => r.json()).then(d => { setSettings(d.settings); setSubscription(d.subscription); setLoading(false); });
  }, []);

  const subscribe = async () => {
    if (!phone) return;
    setSubscribing(true);
    const res = await fetch("/api/student/subscription", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected, phoneNumber: phone }),
    });
    const data = await res.json();
    if (data.subscription) { setSuccess(true); setSubscription(data.subscription); }
    setSubscribing(false);
  };

  const saving = settings ? Math.round(100 - (settings.yearlyPrice / (settings.monthlyPrice * 12)) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;

  if (success || subscription?.status === "ACTIVE") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">You&apos;re subscribed!</h2>
        <p className="text-slate-500">Your <strong>{subscription?.plan}</strong> subscription is active until{" "}
          <strong>{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "—"}</strong>.
        </p>
        <p className="text-sm text-slate-400">Enjoy unlimited access to all courses on LearnHub.</p>
      </div>
    );
  }

  if (subscription?.status === "PENDING") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Payment Pending</h2>
        <p className="text-slate-500">Your subscription payment is being processed. Access will be activated shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Upgrade to Pro</h1>
        <p className="text-slate-500 mt-2">Unlock all courses and features with a LearnHub subscription</p>
      </div>

      {/* Plan toggle */}
      <div className="flex gap-4 justify-center">
        {(["MONTHLY", "YEARLY"] as const).map(plan => (
          <button key={plan} onClick={() => setSelected(plan)}
            className={`relative flex-1 max-w-xs rounded-2xl border-2 p-5 text-left transition-all ${selected === plan ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            {plan === "YEARLY" && saving > 0 && (
              <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Save {saving}%</span>
            )}
            <div className="flex items-center gap-2 mb-2">
              {plan === "MONTHLY" ? <Zap className="w-5 h-5 text-indigo-500" /> : <Crown className="w-5 h-5 text-yellow-500" />}
              <span className="font-semibold text-slate-900">{plan === "MONTHLY" ? "Monthly" : "Yearly"}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatPrice(plan === "MONTHLY" ? (settings?.monthlyPrice ?? 150) : (settings?.yearlyPrice ?? 1500))}</p>
            <p className="text-xs text-slate-500 mt-1">{plan === "MONTHLY" ? "per month" : `per year · ${formatPrice(Math.round((settings?.yearlyPrice ?? 1500) / 12))}/mo`}</p>
          </button>
        ))}
      </div>

      {/* Perks */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Everything included:</h3>
        <div className="grid grid-cols-2 gap-2">
          {perks.map(p => (
            <div key={p} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">Pay via Mobile Money</h3>
        <div className="space-y-1.5">
          <Label>Mobile Number (Airtel / MTN / Zamtel)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0971234567" className="pl-9" />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
          <span>Total due today</span>
          <span className="font-bold text-slate-900 text-base">{formatPrice(selected === "MONTHLY" ? (settings?.monthlyPrice ?? 150) : (settings?.yearlyPrice ?? 1500))}</span>
        </div>
        <Button onClick={subscribe} loading={subscribing} variant="gradient" className="w-full" size="lg">
          <Crown className="w-4 h-4" /> Subscribe Now — {formatPrice(selected === "MONTHLY" ? (settings?.monthlyPrice ?? 150) : (settings?.yearlyPrice ?? 1500))}
        </Button>
        <p className="text-xs text-slate-400 text-center">You can cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}
