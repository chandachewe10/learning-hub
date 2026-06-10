"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen, Bell, Search, Menu, X, GraduationCap,
  LayoutDashboard, LogOut, User, ChevronDown, Sparkles,
  Award, Settings, Users, BookMarked, Video, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const getDashboardHref = () => {
    if (!session) return "/login";
    switch (session.user.role) {
      case "ADMIN":      return "/admin/dashboard";
      case "INSTRUCTOR": return "/instructor/dashboard";
      default:           return "/student/dashboard";
    }
  };

  const roleLinks = () => {
    if (!session) return [];
    if (session.user.role === "ADMIN") return [
      { href: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/courses",    icon: BookOpen,         label: "Courses" },
      { href: "/admin/users",      icon: Users,            label: "Users" },
      { href: "/admin/payments",   icon: Award,            label: "Payments" },
      { href: "/admin/settings",   icon: Settings,         label: "Settings" },
    ];
    if (session.user.role === "INSTRUCTOR") return [
      { href: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/instructor/courses",   icon: BookOpen,         label: "My Courses" },
      { href: "/instructor/live",      icon: Video,            label: "Live Classes" },
      { href: "/instructor/earnings",  icon: Award,            label: "Earnings" },
    ];
    return [
      { href: "/student/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
      { href: "/student/my-courses",   icon: BookMarked,       label: "My Courses" },
      { href: "/student/certificates", icon: Award,            label: "Certificates" },
      { href: "/student/live",         icon: Video,            label: "Live Classes" },
    ];
  };

  return (
    <>
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
            <div className="flex items-center gap-1">
              {session ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>

                  {/* User dropdown (desktop) */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full pr-1 pl-1 py-0.5 hover:bg-slate-100 transition">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                            <AvatarFallback>{getInitials(session.user.name || "U")}</AvatarFallback>
                          </Avatar>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" /> Profile
                          </Link>
                        </DropdownMenuItem>
                        {session.user.role === "STUDENT" && (
                          <DropdownMenuItem asChild>
                            <Link href="/student/my-courses" className="cursor-pointer">
                              <BookOpen className="mr-2 h-4 w-4" /> My Courses
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" variant="gradient">
                      <Sparkles className="w-3.5 h-3.5" /> Get started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Hamburger (mobile) */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile drawer ──────────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">LearnHub</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* User profile card */}
          {session ? (
            <div className="px-5 py-4 bg-slate-50 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-indigo-200">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                    {getInitials(session.user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{session.user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                  <Badge variant="secondary" className="text-xs capitalize mt-1">
                    {session.user.role.toLowerCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 py-5 border-b space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="gradient" className="w-full gap-2">
                  <Sparkles className="w-4 h-4" /> Get started free
                </Button>
              </Link>
            </div>
          )}

          {/* Search */}
          <div className="px-5 pt-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* General links */}
          <div className="px-3 pb-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Explore</p>
            <MobileLink href="/" icon={Home} label="Home" close={() => setMobileOpen(false)} />
            <MobileLink href="/courses" icon={BookOpen} label="Browse Courses" close={() => setMobileOpen(false)} />
            {!session && (
              <MobileLink href="/register?role=instructor" icon={GraduationCap} label="Become an Instructor" close={() => setMobileOpen(false)} />
            )}
          </div>

          {/* Role-specific links */}
          {session && roleLinks().length > 0 && (
            <div className="px-3 pb-2">
              <div className="my-2 mx-3 border-t" />
              <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">My Account</p>
              {roleLinks().map((item) => (
                <MobileLink key={item.href} href={item.href} icon={item.icon} label={item.label} close={() => setMobileOpen(false)} />
              ))}
              <MobileLink href="/profile" icon={User} label="Profile" close={() => setMobileOpen(false)} />
            </div>
          )}
        </div>

        {/* Sign out footer */}
        {session && (
          <div className="px-5 py-4 border-t">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function MobileLink({
  href, icon: Icon, label, close,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  close: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={close}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
      {label}
    </Link>
  );
}
