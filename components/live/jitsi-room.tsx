"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Video, Copy, Check,
  Users, Clock, Mic, Camera, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface JitsiRoomProps {
  roomId: string;
  sessionTitle: string;
  courseTitle: string;
  userName: string;
  userEmail: string;
  isModerator: boolean;
}

export function JitsiRoom({
  roomId,
  sessionTitle,
  courseTitle,
  userName,
  isModerator,
}: JitsiRoomProps) {
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [time, setTime] = useState(new Date());

  const meetUrl = `https://meet.jit.si/${roomId}#userInfo.displayName="${encodeURIComponent(userName)}"`;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://meet.jit.si/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const join = () => {
    setJoined(true);
    window.open(meetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center gap-3 shrink-0">
        <Link href={isModerator ? "/instructor/live-sessions" : "/student/dashboard"}>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{sessionTitle}</p>
          <p className="text-xs text-slate-500 truncate">{courseTitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">

          {/* Status card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{sessionTitle}</h2>
              <p className="text-slate-400 text-sm mt-1">{courseTitle}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Live session is active</span>
            </div>

            {isModerator && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3 text-sm text-indigo-300">
                You are the <strong>host</strong> of this session. Join first to open the room for attendees.
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Mic, label: "Check microphone", sub: "before joining" },
              { icon: Camera, label: "Test your camera", sub: "for best quality" },
              { icon: Monitor, label: "Share screen", sub: "available in-call" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-white font-medium">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={join}
              variant="gradient"
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              <Video className="w-5 h-5" />
              {joined ? "Rejoin Meeting" : "Join Meeting Now"}
              <ExternalLink className="w-4 h-4 ml-1 opacity-60" />
            </Button>

            {joined && (
              <p className="text-center text-xs text-slate-500">
                Meeting opened in a new tab. Come back here when you&apos;re done.
              </p>
            )}

            <div className="flex gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono truncate">
                meet.jit.si/{roomId}
              </div>
              <Button
                onClick={copyLink}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
              >
                {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
              </Button>
            </div>

            {isModerator && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                <Users className="w-4 h-4 shrink-0 text-indigo-400" />
                Share the copied link with your students so they can join directly.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
