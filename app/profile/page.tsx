"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      await update({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const role = session?.user?.role as string | undefined;
  const dashboardUrl = role === "ADMIN" ? "/admin/dashboard" : role === "INSTRUCTOR" ? "/instructor/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6 pt-16">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 text-sm">Manage your account information</p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            Profile updated successfully!
          </div>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-indigo-600" /> Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-lg">{getInitials(session?.user?.name || "U")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900">{session?.user?.name}</p>
                <p className="text-sm text-slate-500">{session?.user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{role}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={name} onChange={e => setName(e.target.value)} className="pl-9" placeholder="Your name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={session?.user?.email || ""} readOnly className="pl-9 bg-slate-50 text-slate-500" />
              </div>
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={save} loading={saving} variant="gradient"><Save className="w-4 h-4" /> Save Changes</Button>
              <Button onClick={() => router.push(dashboardUrl)} variant="outline">Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
