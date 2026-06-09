"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice } from "@/lib/utils";

interface Coupon { id: string; code: string; type: string; discount: number; maxUses: number | null; usedCount: number; expiresAt: string | null; isActive: boolean }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", type: "PERCENT", discount: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/coupons").then(r => r.json()).then(d => { setCoupons(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, discount: parseFloat(form.discount), maxUses: form.maxUses ? parseInt(form.maxUses) : null, expiresAt: form.expiresAt || null }),
    });
    const data = await res.json();
    setCoupons(c => [data, ...c]);
    setAdding(false);
    setForm({ code: "", type: "PERCENT", discount: "", maxUses: "", expiresAt: "" });
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method: "DELETE" });
    setCoupons(c => c.filter(x => x.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
          <p className="text-slate-500 text-sm">Create and manage discount codes</p>
        </div>
        <Button onClick={() => setAdding(!adding)} variant="gradient"><Plus className="w-4 h-4" /> New Coupon</Button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl border p-5 space-y-4">
          <h3 className="font-semibold text-slate-900">Create Coupon</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount (ZMW)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Discount Value</Label>
              <Input value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} type="number" placeholder={form.type === "PERCENT" ? "20" : "50"} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Uses (optional)</Label>
              <Input value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} type="number" placeholder="100" />
            </div>
            <div className="space-y-1.5">
              <Label>Expires At (optional)</Label>
              <Input value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} type="date" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} loading={saving} variant="gradient" size="sm">Create Coupon</Button>
            <Button onClick={() => setAdding(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono font-bold">{c.code}</code>
                      <button onClick={() => copy(c.code)} className="text-slate-400 hover:text-slate-600">
                        {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.type === "PERCENT" ? `${c.discount}%` : formatPrice(c.discount)}</td>
                  <td className="px-4 py-3 text-slate-600">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-4 py-3 text-slate-600">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteTarget(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No coupons yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete coupon?"
        description={`Coupon "${deleteTarget?.code}" will be permanently deleted and can no longer be used.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
