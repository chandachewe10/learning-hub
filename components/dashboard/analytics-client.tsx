"use client";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

interface Props {
  monthlyEnrollments: Array<{ month: string; count: number }>;
  monthlyRevenue: Array<{ month: string; total: number }>;
  topCourses: Array<{ name: string; enrollments: number }>;
  userGrowth: Array<{ month: string; count: number }>;
}

export function AnalyticsClient({ monthlyEnrollments, monthlyRevenue, topCourses, userGrowth }: Props) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm">Platform performance metrics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollments */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Enrollments</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyEnrollments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Enrollments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Revenue (ZMW)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`ZMW ${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Courses by Enrollment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCourses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Enrollments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
