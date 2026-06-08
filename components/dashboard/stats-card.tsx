import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className, iconClassName }: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border p-5 flex items-start gap-4", className)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", iconClassName || "bg-indigo-50")}>
        <Icon className={cn("w-6 h-6", iconClassName ? "text-white" : "text-indigo-600")} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs font-medium mt-1 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
    </div>
  );
}
