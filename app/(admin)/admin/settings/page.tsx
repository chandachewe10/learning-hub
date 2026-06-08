"use client";

import { useState, useEffect } from "react";
import { Settings, DollarSign, Users, Percent, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Settings {
  id: string; commissionRate: number; monthlyPrice: number; yearlyPrice: number;
  referralReward: number; referralRewardType: string; platformName: string; currency: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { setSettings(d); setLoading(false); });
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const data = await res.json();
    setSettings(data);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (key: keyof Settings, value: string | number) => setSettings(s => s ? { ...s, [key]: value } : s);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 text-sm">Configure commissions, pricing, and referral rewards</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}

      {/* Commission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Percent className="w-4 h-4 text-green-600" /></div>
            Platform Commission
          </CardTitle>
          <CardDescription>Percentage you earn from every course sale. Instructors keep the rest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Commission Rate (%)</Label>
            <div className="flex items-center gap-3">
              <Input type="number" min="0" max="100" value={settings?.commissionRate ?? 30}
                onChange={e => set("commissionRate", e.target.value)} className="w-32" />
              <div className="flex-1 bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                <p>Course sold at <strong>K200</strong> → You earn <strong>K{((settings?.commissionRate ?? 30) / 100 * 200).toFixed(0)}</strong>, instructor earns <strong>K{(200 - (settings?.commissionRate ?? 30) / 100 * 200).toFixed(0)}</strong></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><DollarSign className="w-4 h-4 text-indigo-600" /></div>
            Subscription Pricing
          </CardTitle>
          <CardDescription>Set the price for monthly and yearly student subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Monthly Price (ZMW)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">K</span>
                <Input type="number" min="0" value={settings?.monthlyPrice ?? 150}
                  onChange={e => set("monthlyPrice", e.target.value)} className="pl-7" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Yearly Price (ZMW)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">K</span>
                <Input type="number" min="0" value={settings?.yearlyPrice ?? 1500}
                  onChange={e => set("yearlyPrice", e.target.value)} className="pl-7" />
              </div>
              <p className="text-xs text-green-600">
                {settings && `${Math.round(100 - (settings.yearlyPrice / (settings.monthlyPrice * 12)) * 100)}% cheaper than monthly`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Reward */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Users className="w-4 h-4 text-purple-600" /></div>
            Referral Reward
          </CardTitle>
          <CardDescription>What users earn when someone they refer makes their first purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Reward Type</Label>
              <Select value={settings?.referralRewardType ?? "FIXED"} onValueChange={v => set("referralRewardType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed Amount (ZMW)</SelectItem>
                  <SelectItem value="PERCENT">Percentage of Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reward Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  {settings?.referralRewardType === "PERCENT" ? "%" : "K"}
                </span>
                <Input type="number" min="0" value={settings?.referralReward ?? 50}
                  onChange={e => set("referralReward", e.target.value)} className="pl-7" />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            When a referred user signs up and purchases, the referrer earns{" "}
            {settings?.referralRewardType === "PERCENT"
              ? `${settings?.referralReward}% of the purchase amount`
              : `K${settings?.referralReward} fixed reward`}.
          </p>
        </CardContent>
      </Card>

      <Button onClick={save} loading={saving} variant="gradient" size="lg">
        <Save className="w-4 h-4" /> Save All Settings
      </Button>
    </div>
  );
}
