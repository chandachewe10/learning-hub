"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JitsiRoomProps {
  roomId: string;
  sessionTitle: string;
  courseTitle: string;
  userName: string;
  userEmail: string;
  isModerator: boolean;
}

interface JitsiAPI {
  executeCommand: (command: string, ...args: unknown[]) => void;
  dispose: () => void;
  addEventListeners: (events: Record<string, () => void>) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: (new (domain: string, options: Record<string, unknown>) => JitsiAPI) | undefined;
  }
}

export function JitsiRoom({
  roomId,
  sessionTitle,
  courseTitle,
  userName,
  userEmail,
  isModerator,
}: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const directUrl = `https://meet.jit.si/${roomId}`;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initJitsi();
    script.onerror = () => setError("LOAD_FAILED");
    document.head.appendChild(script);

    return () => {
      apiRef.current?.dispose();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const initJitsi = () => {
    if (!containerRef.current || !window.JitsiMeetExternalAPI) {
      setError("LOAD_FAILED");
      return;
    }

    try {
      const JitsiAPI = window.JitsiMeetExternalAPI;
      apiRef.current = new JitsiAPI("meet.jit.si", {
        roomName: roomId,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        style: { border: 0, height: "100%", width: "100%" },
        userInfo: { displayName: userName, email: userEmail },
        configOverwrite: {
          startWithAudioMuted: !isModerator,
          startWithVideoMuted: !isModerator,
          disableDeepLinking: true,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableInviteFunctions: false,
          toolbarButtons: [
            "microphone", "camera", "desktop", "fullscreen",
            "hangup", "chat", "raisehand", "tileview", "whiteboard",
          ],
        },
      });

      // Hide loading on join OR after a 6s timeout (event may not always fire)
      const timeout = setTimeout(() => setLoading(false), 6000);

      apiRef.current.addEventListeners({
        videoConferenceJoined: () => { clearTimeout(timeout); setLoading(false); },
        videoConferenceLeft: () => { clearTimeout(timeout); },
        errorOccurred: () => { clearTimeout(timeout); setLoading(false); },
      });
    } catch {
      setError("INIT_FAILED");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-5 p-8 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <p className="text-white font-semibold text-lg mb-2">Could not load video call</p>
            <p className="text-slate-400 text-sm">
              {error === "LOAD_FAILED"
                ? "Failed to load Jitsi Meet script. This may be a network or browser extension issue."
                : "Could not initialize the video room."}
            </p>
          </div>
          <div className="space-y-2">
            <a href={directUrl} target="_blank" rel="noreferrer" className="block">
              <Button variant="gradient" className="w-full">
                <ExternalLink className="w-4 h-4" /> Open in Jitsi Directly
              </Button>
            </a>
            <Link href="/student/dashboard">
              <Button variant="outline" className="w-full text-white border-white/20">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center gap-3 shrink-0 h-12">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{sessionTitle}</p>
          <p className="text-xs text-slate-400 truncate">{courseTitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isModerator && (
            <span className="text-xs bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Moderator
            </span>
          )}
          <a href={directUrl} target="_blank" rel="noreferrer" title="Open in new tab">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-8 h-8">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Jitsi container — fills all remaining height */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div
            className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10 cursor-pointer"
            onClick={() => setLoading(false)}
          >
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <div>
                <p className="text-slate-300 text-sm">Connecting to live class...</p>
                <p className="text-slate-500 text-xs mt-1">Click anywhere to dismiss</p>
              </div>
              <a href={directUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-800">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Jitsi App
                </Button>
              </a>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
