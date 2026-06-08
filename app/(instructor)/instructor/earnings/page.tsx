import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { DollarSign, TrendingUp, Users, BookOpen, Percent } from "lucide-react";

export const metadata = { title: "Earnings" };

export default async function InstructorEarningsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [courses, settings] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: session.user.id },
      select: { id: true, title: true, thumbnail: true },
    }),
    prisma.platformSettings.findFirst(),
  ]);

  const courseIds = courses.map(c => c.id);
  const commissionRate = settings?.commissionRate ?? 30;

  const payments = await prisma.payment.findMany({
    where: { courseId: { in: courseIds }, status: "COMPLETED" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const courseMap = new Map(courses.map(c => [c.id, c.title]));

  const grossRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const platformFee = grossRevenue * (commissionRate / 100);
  const netEarnings = grossRevenue - platformFee;
  const thisMonth = payments
    .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((s, p) => s + p.amount * (1 - commissionRate / 100), 0);
  const enrollments = await prisma.enrollment.count({ where: { courseId: { in: courseIds } } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="text-slate-500 text-sm">Platform takes {commissionRate}% commission — you keep {100 - commissionRate}%</p>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">
          <Percent className="w-3.5 h-3.5" />
          {commissionRate}% platform fee
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Your Net Earnings", value: formatPrice(netEarnings), icon: DollarSign, color: "text-green-600 bg-green-50" },
          { label: "This Month (net)", value: formatPrice(thisMonth), icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Students", value: enrollments.toString(), icon: Users, color: "text-purple-600 bg-purple-50" },
          { label: "Total Courses", value: courses.length.toString(), icon: BookOpen, color: "text-blue-600 bg-blue-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Commission breakdown banner */}
      <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between text-white">
        <div>
          <p className="text-sm text-slate-400 mb-0.5">Revenue Breakdown</p>
          <p className="font-semibold">Gross Sales: {formatPrice(grossRevenue)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Platform Fee ({commissionRate}%)</p>
          <p className="text-red-400 font-semibold">−{formatPrice(platformFee)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Your Earnings ({100 - commissionRate}%)</p>
          <p className="text-green-400 font-bold text-xl">{formatPrice(netEarnings)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-slate-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Course</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Gross</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Platform Fee</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Your Share</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(p => {
                const fee = p.amount * (commissionRate / 100);
                const net = p.amount - fee;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{p.user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.courseId ? courseMap.get(p.courseId) ?? "—" : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 text-red-400">−{formatPrice(fee)}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{formatPrice(net)}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No payments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
