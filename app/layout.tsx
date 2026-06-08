import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/shared/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LearnHub — Learn. Grow. Succeed.",
    template: "%s | LearnHub",
  },
  description:
    "Discover thousands of courses taught by expert instructors. Master new skills with video lessons, live classes, and hands-on projects.",
  keywords: ["online learning", "courses", "education", "e-learning", "LMS"],
  authors: [{ name: "LearnHub" }],
  creator: "LearnHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "LearnHub",
    title: "LearnHub — Learn. Grow. Succeed.",
    description: "Discover thousands of courses taught by expert instructors.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnHub — Learn. Grow. Succeed.",
    description: "Discover thousands of courses taught by expert instructors.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
