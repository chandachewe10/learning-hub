import Link from "next/link";
import { GraduationCap, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              LearnHub
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Empowering learners worldwide with high-quality online education. Learn at your pace, on your schedule.
            </p>
            <div className="flex gap-3 mt-6">
              {[ExternalLink, ExternalLink, ExternalLink, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Learn</h3>
            <ul className="space-y-2.5 text-sm">
              {["All Courses", "Categories", "Free Courses", "Certificates", "Live Classes"].map((item) => (
                <li key={item}>
                  <Link href="/courses" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Teach</h3>
            <ul className="space-y-2.5 text-sm">
              {["Become an Instructor", "Instructor Dashboard", "Course Guidelines", "Payouts"].map((item) => (
                <li key={item}>
                  <Link href="/register?role=instructor" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm">
              {["About Us", "Careers", "Blog", "Press", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 space-y-3 text-sm text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
          <p className="text-center text-slate-600 text-xs">
            Powered, created and owned by{" "}
            <a
              href="https://macroit.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              MACROIT INFORMATION TECHNOLOGY
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
