"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, Calendar, Clock, Users, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Course { id: string; title: string }

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  jitsiRoomId: string;
  endedAt: Date | null;
  course: { title: string };
}

interface Props {
  courses: Course[];
  sessions: LiveSession[];
}

export function LiveSessionsClient({ courses, sessions: initialSessions }: Props) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledAt: "",
    maxAttendees: "25",
  });

  const handleCreate = async () => {
    if (!form.title || !form.courseId || !form.scheduledAt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessions((prev) => [data.session, ...prev]);
        setShowForm(false);
        setForm({ title: "", description: "", courseId: "", scheduledAt: "", maxAttendees: "25" });
      }
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (jitsiRoomId: string) => {
    window.open(`/live/${jitsiRoomId}`, "_blank", "width=1200,height=800");
  };

  const getStatus = (session: LiveSession) => {
    const now = new Date();
    const scheduled = new Date(session.scheduledAt);
    if (session.endedAt) return { label: "Ended", variant: "secondary" as const };
    if (scheduled > now) return { label: "Upcoming", variant: "warning" as const };
    return { label: "Live", variant: "success" as const };
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Sessions</h1>
          <p className="text-slate-500 text-sm mt-1">Schedule and manage your virtual classes</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Session
        </Button>
      </div>

      {/* Sessions list */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No live sessions scheduled yet</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const status = getStatus(session);
            const scheduled = new Date(session.scheduledAt);
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      status.label === "Live" ? "bg-red-100 animate-pulse" : "bg-indigo-100"
                    }`}>
                      <Video className={`w-6 h-6 ${status.label === "Live" ? "text-red-600" : "text-indigo-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-slate-900">{session.title}</h3>
                          <p className="text-sm text-slate-500">{session.course.title}</p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      {session.description && (
                        <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {scheduled.toLocaleDateString("en-ZM", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scheduled.toLocaleTimeString("en-ZM", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={status.label === "Live" ? "default" : "outline"}
                        className="gap-1"
                        onClick={() => joinRoom(session.jitsiRoomId)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {status.label === "Upcoming" ? "Open Room" : "Join"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Live Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Session Title <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Introduction to React Hooks"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Course <span className="text-red-500">*</span></Label>
              <Select value={form.courseId} onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date & Time <span className="text-red-500">*</span></Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What will you cover in this session?"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Attendees</Label>
              <Input
                type="number"
                value={form.maxAttendees}
                readOnly
                className="bg-slate-50 cursor-not-allowed text-slate-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleCreate} loading={loading}>
              Schedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
