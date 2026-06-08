import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status;
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = status ? { status: status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" } : {};

  const [payments, total, stats] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const statusVariant = (s: string) => {
    if (s === "COMPLETED") return "success";
    if (s === "PENDING") return "warning";
    if (s === "FAILED") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500 text-sm">
          {stats._count} completed payments · Total: {formatPrice(stats._sum.amount || 0, "ZMW")}
        </p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{payment.referenceId.slice(0, 16)}...</td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{payment.user.name}</p>
                      <p className="text-xs text-slate-400">{payment.user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(payment.amount, payment.currency)}</td>
                  <td className="px-5 py-3"><Badge variant="secondary" className="text-xs capitalize">{payment.type.toLowerCase()}</Badge></td>
                  <td className="px-5 py-3 text-xs text-slate-500 capitalize">{payment.method.toLowerCase().replace("_", " ")}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant(payment.status) as "success" | "warning" | "destructive" | "secondary"} className="text-xs capitalize">
                      {payment.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No payments found</div>
        )}
      </div>
    </div>
  );
}
