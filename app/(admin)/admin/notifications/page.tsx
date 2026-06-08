"use client";

import { useState } from "react";
import { Bell, Send, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: "", message: "", type: "SYSTEM", target: "ALL" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!form.title || !form.message) return;
    setSending(true);
    await fetch("/api/admin/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSent(true);
    setSending(false);
    setForm({ title: "", message: "", type: "SYSTEM", target: "ALL" });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 text-sm">Send platform-wide announcements to users</p>
      </div>

      {sent && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notification sent successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6 space-y-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" /> Broadcast Notification
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Notification Type</Label>
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                <SelectItem value="PROMOTION">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Send To</Label>
            <Select value={form.target} onValueChange={v => setForm(f => ({ ...f, target: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                <SelectItem value="STUDENT">Students Only</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Platform Maintenance Scheduled" />
        </div>

        <div className="space-y-1.5">
          <Label>Message</Label>
          <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your notification message..." rows={4} />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={send} loading={sending} variant="gradient">
            <Send className="w-4 h-4" />
            {form.target === "ALL" ? "Send to All Users" : `Send to ${form.target === "STUDENT" ? "Students" : "Instructors"}`}
          </Button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            {form.target === "ALL" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            {form.target === "ALL" ? "All registered users" : form.target === "STUDENT" ? "Students only" : "Instructors only"}
          </div>
        </div>
      </div>
    </div>
  );
}
