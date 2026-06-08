"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, PlusCircle, Video,
  DollarSign, Users, Bell, LogOut, GraduationCap,
  Settings, ChevronLeft, ChevronRight, BarChart3
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { href: "/instructor/courses/new", label: "New Course", icon: PlusCircle },
  { href: "/instructor/live-sessions", label: "Live Sessions", icon: Video },
  { href: "/instructor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/instructor/students", label: "Students", icon: Users },
  { href: "/instructor/notifications", label: "Notifications", icon: Bell },
];

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

export function InstructorSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} shrink-0 bg-white border-r flex flex-col transition-all duration-200 min-h-screen sticky top-0`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900">LearnHub</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              } ${collapsed ? "justify-center" : ""}`}>
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                {!collapsed && label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-xs">{getInitials(user.name || "I")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
