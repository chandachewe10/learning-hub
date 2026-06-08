"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, BookOpen, DollarSign, BarChart3,
  Tag, Settings, LogOut, GraduationCap, Bell, Percent
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/coupons", label: "Coupons", icon: Percent },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface User { name?: string | null; email?: string | null; image?: string | null; role: string }

export function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col min-h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">LearnHub</span>
        </Link>
        <p className="text-xs text-slate-500 mt-1 ml-10">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-xs bg-slate-700 text-white">{getInitials(user.name || "A")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-500 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
