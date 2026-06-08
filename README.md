# LearnHub — Online Learning Platform

A full-featured LMS (Learning Management System) built with Next.js 16, TypeScript, Prisma, and Tailwind CSS. Comparable to Udemy/Coursera, with Lipila payment integration for the Zambian market.

## Features

- **Three Roles:** Admin, Instructor, Student
- **Course Management:** Create, upload videos (Cloudinary), manage curriculum
- **Live Classes:** Jitsi Meet integration (no API key required)
- **Payments:** Lipila (Mobile Money + Card) — Airtel, MTN, Zamtel
- **Subscriptions:** Monthly (K299) and Yearly (K199/month) plans
- **Progress Tracking:** Automatic completion detection + certificates
- **Authentication:** NextAuth v5 (email/password + Google OAuth)
- **Admin Panel:** User management, course approvals, analytics charts
- **Notifications:** In-app + transactional email via Resend

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom components |
| Database | PostgreSQL (Neon) via Prisma |
| Auth | NextAuth v5 |
| Video | Cloudinary |
| Live Classes | Jitsi Meet |
| Payments | Lipila (api.lipila.dev) |
| Email | Resend |
| Deployment | Vercel |

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd LearningPlatform
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required services:
- **Neon** — Free PostgreSQL: [neon.tech](https://neon.tech)
- **Cloudinary** — Free tier (25GB): [cloudinary.com](https://cloudinary.com)
- **Lipila** — Payment gateway: [api.lipila.dev](https://api.lipila.dev)
- **Resend** — Free 100 emails/day: [resend.com](https://resend.com)
- **Google OAuth** — [console.cloud.google.com](https://console.cloud.google.com)

### 3. Database Setup

```bash
# Push schema to Neon
npm run db:push

# Seed with test data
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@learnhub.com | Admin@123! |
| Instructor | instructor@learnhub.com | Instructor@123! |
| Student | student@learnhub.com | Student@123! |

## Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Add **Neon** integration from Vercel Marketplace (auto-sets `DATABASE_URL`)
5. Deploy — Prisma generate runs automatically via `vercel.json`

> **Important:** Set `NEXT_PUBLIC_APP_URL` to your production Vercel URL for Lipila card payments (`backUrl` / `redirectUrl` must be a public HTTPS URL).

## Project Structure

```
app/
  page.tsx              ← Landing page
  (auth)/               ← Login, Register, Forgot Password
  (public)/courses/     ← Course catalog + detail
  (student)/            ← Student dashboard, learn, certificates
  (instructor)/         ← Instructor dashboard, course editor
  (admin)/              ← Admin panel
  api/                  ← All API routes
  live/[roomId]/        ← Jitsi Meet room

components/
  ui/                   ← Button, Input, Card, Badge, etc.
  layout/               ← Navbar, Footer, Sidebars
  courses/              ← CourseCard, CourseEditor, LearnPage
  payments/             ← PaymentModal (Lipila)
  live/                 ← JitsiRoom, LiveSessionsClient
  dashboard/            ← StatsCard, Analytics charts

lib/
  prisma.ts             ← Prisma client
  auth.ts               ← NextAuth config
  cloudinary.ts         ← Video/image upload helpers
  lipila.ts             ← Payment gateway helpers
  email.ts              ← Resend email helpers
  utils.ts              ← Utility functions

prisma/
  schema.prisma         ← Full database schema
  seed.ts               ← Test data seeder
```

## Payment Integration (Lipila)

Payments use the same API as the `rema` project but via a Next.js API route instead of PHP:

- **Mobile Money:** `POST /api/payments/lipila` with `type: "momo"` → triggers Airtel/MTN/Zamtel prompt
- **Card:** `POST /api/payments/lipila` with `type: "card"` → redirects to Lipila hosted checkout
- **Webhook:** `POST /api/payments/webhook` → confirms payment, activates enrollment/subscription

## License

MIT
