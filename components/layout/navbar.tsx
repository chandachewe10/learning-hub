"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  BookOpen, Bell, Search, Menu, X, GraduationCap,
  LayoutDashboard, LogOut, User, ChevronDown, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardHref = () => {
    if (!session) return "/login";
    switch (session.user.role) {
      case "ADMIN": return "/admin/dashboard";
      case "INSTRUCTOR": return "/instructor/dashboard";
      default: return "/student/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">LearnHub</span>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search courses, instructors..."
                className="w-full pl-9 pr-4 py-2 rounded-full border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600">
                Courses
              </Button>
            </Link>
            {!session && (
              <Link href="/register?role=instructor">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600">
                  Teach
                </Button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full pr-1 pl-1 py-0.5 hover:bg-slate-100 transition">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>{getInitials(session.user.name || "U")}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs capitalize mt-1">
                          {session.user.role.toLowerCase()}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardHref()} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role === "STUDENT" && (
                      <DropdownMenuItem asChild>
                        <Link href="/student/my-courses" className="cursor-pointer">
                          <BookOpen className="mr-2 h-4 w-4" />
                          My Courses
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="gradient">
                    <Sparkles className="w-3.5 h-3.5" />
                    Get started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search courses..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Link href="/courses" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Courses</Button>
            </Link>
            {!session && (
              <Link href="/register?role=instructor" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Become an Instructor</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
