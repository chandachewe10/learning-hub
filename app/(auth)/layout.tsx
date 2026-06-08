import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />

      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">LearnHub</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="relative z-10 p-6 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} LearnHub. All rights reserved.
      </footer>
    </div>
  );
}
