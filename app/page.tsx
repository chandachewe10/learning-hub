import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play, Star, Users, BookOpen, Trophy, Zap, Shield, Globe,
  CheckCircle, ArrowRight, Sparkles, TrendingUp, Video,
  Clock, Award, BarChart3, GraduationCap, ChevronRight
} from "lucide-react";

const stats = [
  { label: "Active Students", value: "50,000+", icon: Users },
  { label: "Expert Courses", value: "2,500+", icon: BookOpen },
  { label: "Top Instructors", value: "800+", icon: GraduationCap },
  { label: "Certificates Issued", value: "120,000+", icon: Trophy },
];

const categories = [
  { name: "Web Development", icon: "💻", count: 320, color: "from-blue-500 to-cyan-500" },
  { name: "Data Science", icon: "📊", count: 185, color: "from-purple-500 to-violet-500" },
  { name: "Design", icon: "🎨", count: 215, color: "from-pink-500 to-rose-500" },
  { name: "Business", icon: "💼", count: 290, color: "from-amber-500 to-orange-500" },
  { name: "Marketing", icon: "📢", count: 160, color: "from-green-500 to-emerald-500" },
  { name: "Photography", icon: "📷", count: 95, color: "from-indigo-500 to-blue-500" },
  { name: "Music", icon: "🎵", count: 75, color: "from-red-500 to-pink-500" },
  { name: "Health & Fitness", icon: "💪", count: 140, color: "from-teal-500 to-cyan-500" },
];

const features = [
  {
    icon: Video,
    title: "HD Video Lessons",
    description: "Stream high-quality video content from anywhere, on any device with offline support.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Users,
    title: "Live Virtual Classes",
    description: "Join live interactive sessions, Q&A sessions, and collaborate with peers in real time.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Trophy,
    title: "Certificates",
    description: "Earn industry-recognized certificates upon course completion to boost your career.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and milestone achievements.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Access courses in multiple languages and learn from instructors worldwide.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Pay securely via Mobile Money (Airtel, MTN, Zamtel) or Card through Lipila.",
    color: "bg-rose-100 text-rose-600",
  },
];

const testimonials = [
  {
    name: "Chanda Mwamba",
    role: "Software Developer",
    avatar: "CM",
    rating: 5,
    text: "LearnHub completely transformed my career. The web development courses are world-class, and I landed my dream job within 3 months of completing the curriculum.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Bwalya Mutale",
    role: "Data Analyst",
    avatar: "BM",
    rating: 5,
    text: "The data science track was exactly what I needed. The instructors are brilliant, and the live sessions made all the difference. Highly recommended!",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Natasha Phiri",
    role: "Graphic Designer",
    avatar: "NP",
    rating: 5,
    text: "As a designer, I love the quality of the design courses. The video quality is excellent and the mobile money payment made it so easy to subscribe.",
    color: "from-pink-500 to-rose-500",
  },
];

const plans = [
  {
    name: "Monthly",
    price: "K299",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Access all subscription courses",
      "HD video streaming",
      "Mobile & desktop access",
      "Progress tracking",
      "Community forums",
      "Email support",
    ],
    popular: false,
    cta: "Start Monthly",
    variant: "outline" as const,
  },
  {
    name: "Yearly",
    price: "K199",
    period: "/month",
    billed: "Billed K2,388/year",
    description: "Best value — save 33%",
    features: [
      "Everything in Monthly",
      "Live class access",
      "Downloadable resources",
      "Course certificates",
      "Priority support",
      "Offline viewing",
      "Coupon access",
    ],
    popular: true,
    cta: "Start Yearly — Best Value",
    variant: "gradient" as const,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur">
                  <Sparkles className="w-3 h-3 mr-1" />
                  #1 Online Learning Platform in Zambia
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Learn New Skills,{" "}
                <span className="gradient-text">Unlock Your</span>{" "}
                Full Potential
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                Access thousands of expert-led courses in web development, design, data science, business, and more. 
                Learn at your own pace and earn recognized certificates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="xl" variant="gradient" className="w-full sm:w-auto">
                    <Zap className="w-5 h-5" />
                    Explore Courses
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                {["No credit card required", "Cancel anytime", "Mobile money accepted"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-sm">
                <div className="absolute -top-4 -left-4 w-full h-full bg-indigo-600/20 rounded-2xl rotate-3" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Full-Stack Web Dev</p>
                      <p className="text-slate-400 text-xs">by John Doe</p>
                    </div>
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Live</Badge>
                  </div>

                  <div className="bg-white/5 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>68%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Lessons", value: "48" },
                      { label: "Hours", value: "24" },
                      { label: "Students", value: "2.4k" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 rounded-lg p-2">
                        <p className="font-bold text-white text-sm">{value}</p>
                        <p className="text-slate-400 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Certificate</p>
                    <p className="text-xs text-slate-500">Earned today!</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">1,200 joined</p>
                    <p className="text-xs text-slate-500">this week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Browse by category</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Explore Top Categories
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl mx-auto">
              Find the perfect course from our wide range of categories taught by world-class instructors.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(({ name, icon, count, color }) => (
              <Link key={name} href={`/courses?category=${encodeURIComponent(name)}`}>
                <div className="group bg-white rounded-xl p-5 border hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {icon}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{count} courses</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Why LearnHub</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl mx-auto">
              Our platform is packed with features designed to make your learning experience exceptional.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="group p-6 rounded-xl border hover:border-indigo-200 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 mb-3">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl mx-auto">
              Choose the plan that works best for you. Pay via Mobile Money or Card — no hassle.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-8 border-2 transition-all ${plan.popular ? "border-indigo-500 shadow-xl shadow-indigo-100 bg-white" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                  {plan.billed && <p className="text-xs text-slate-500 mt-1">{plan.billed}</p>}
                  <p className="text-sm text-slate-600 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant={plan.variant} className="w-full" size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Individual courses also available for one-time purchase.{" "}
            <Link href="/courses" className="text-indigo-600 hover:underline">Browse courses →</Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Student Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Loved by Thousands of Learners
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, avatar, rating, text, color }) => (
              <Card key={name} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-1 bg-gradient-to-r ${color}`} />
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold text-sm`}>
                      {avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{name}</p>
                      <p className="text-slate-500 text-xs">{role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Start Your Learning Journey Today
          </h2>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
            Join over 50,000 students already learning on LearnHub. Pay with Mobile Money or Card.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto font-bold">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Browse Courses
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
