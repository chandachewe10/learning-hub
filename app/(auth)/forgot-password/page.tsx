"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSent(true);
  };

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-white">Reset password</CardTitle>
        <CardDescription className="text-slate-300">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-white font-medium">Check your email</p>
            <p className="text-slate-300 text-sm">We&apos;ve sent a password reset link to your email.</p>
            <Link href="/login">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" variant="gradient" loading={isSubmitting}>
              Send Reset Link
            </Button>
            <Link href="/login">
              <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-white gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Button>
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
