import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role as string | undefined;

  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.some((r) => nextUrl.pathname.startsWith(r));
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/courses" ||
    nextUrl.pathname.startsWith("/courses/") ||
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname.startsWith("/_next/") ||
    nextUrl.pathname.startsWith("/payment/") ||
    nextUrl.pathname === "/unauthorized" ||
    isAuthRoute; // login/register/forgot-password are always publicly accessible

  if (isAuthRoute && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    if (role === "INSTRUCTOR") return NextResponse.redirect(new URL("/instructor/dashboard", nextUrl));
    return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
  }

  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
  }

  if (isLoggedIn) {
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
    if (nextUrl.pathname.startsWith("/instructor") && role !== "INSTRUCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
