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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://learnhub.macroit.org";
const OG_IMAGE = `${APP_URL}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "LearnHub — Learn. Grow. Succeed.",
    template: "%s | LearnHub",
  },
  description:
    "Discover expert-led courses, live classes, and certificates on LearnHub. Master new skills with video lessons, quizzes, and hands-on projects.",
  keywords: ["online learning", "courses", "education", "e-learning", "LMS", "certificates", "live classes"],
  authors: [{ name: "LearnHub", url: APP_URL }],
  creator: "LearnHub",
  publisher: "MACROIT INFORMATION TECHNOLOGY",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "LearnHub",
    title: "LearnHub — Learn. Grow. Succeed.",
    description:
      "Discover expert-led courses, live classes, and certificates on LearnHub.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "LearnHub — Learn. Grow. Succeed.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@learnhub",
    creator: "@learnhub",
    title: "LearnHub — Learn. Grow. Succeed.",
    description:
      "Discover expert-led courses, live classes, and certificates on LearnHub.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: APP_URL,
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
