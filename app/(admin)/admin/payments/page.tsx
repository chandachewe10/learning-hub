"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  DollarSign, Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Payment {
  id: string;
  referenceId: string;
  amount: number;
  currency: string;
  method: string;
  type: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  narration: string | null;
  phoneNumber: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
}

const STATUS_FILTERS = ["ALL", "PENDING", "COMPLETED", "FAILED"] as const;

const statusStyle: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "FAILED">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const qs = filter !== "ALL" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/payments${qs}`);
    const data = await res.json();
    setPayments(data.payments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const confirm = async (paymentId: string, action: "confirm" | "fail") => {
    setConfirming(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(
        action === "confirm"
          ? "Payment confirmed — enrollment & referral reward processed."
          : "Payment marked as failed.",
        "success"
      );
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setConfirming(null);
    }
  };

  const filtered = payments.filter(p =>
    search === "" ||
    p.user.email.toLowerCase().includes(search.toLowerCase()) ||
    p.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.referenceId.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = payments.filter(p => p.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm">{total} total transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              {pendingCount} pending
            </span>
          )}
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(payments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0)), color: "text-green-600 bg-green-50" },
          { label: "Pending", value: payments.filter(p => p.status === "PENDING").length.toString(), color: "text-yellow-600 bg-yellow-50" },
          { label: "Failed", value: payments.filter(p => p.status === "FAILED").length.toString(), color: "text-red-600 bg-red-50" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email or ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading payments…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{p.user.name ?? "User"}</p>
                      <p className="text-xs text-slate-400">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.referenceId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(p.amount, p.currency)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{p.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.method.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}<br />
                      <span className="text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="gradient"
                            className="h-7 text-xs"
                            disabled={confirming === p.id}
                            onClick={() => confirm(p.id, "confirm")}
                          >
                            {confirming === p.id ? (
                              <Clock className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            disabled={confirming === p.id}
                            onClick={() => confirm(p.id, "fail")}
                          >
                            <XCircle className="w-3 h-3" />
                            Fail
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
