import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

/**
 * Edge-compatible auth config — no Node.js modules (no Prisma, no bcrypt).
 * Used by proxy.ts (middleware) which runs in the Edge runtime.
 * Full auth (with Prisma adapter + bcrypt) lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider defined here without authorize() — the real
    // authorize() lives in auth.ts and runs only in the Node.js runtime.
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Basic auth check only — detailed RBAC is handled inside proxy.ts
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/forgot-password");

      if (isAuthPage) return true;
      if (!isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error custom fields added by full auth.ts
        token.role = user.role;
        // @ts-expect-error custom fields added by full auth.ts
        token.isApproved = user.isApproved;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // @ts-expect-error custom fields
        session.user.role = token.role;
        // @ts-expect-error custom fields
        session.user.isApproved = token.isApproved;
      }
      return session;
    },
  },
};
