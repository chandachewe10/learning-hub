"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initJitsi();
    script.onerror = () => setError("Failed to load Jitsi Meet. Please check your connection.");
    document.head.appendChild(script);

    return () => {
      apiRef.current?.dispose();
      document.head.removeChild(script);
    };
  }, []);

  const initJitsi = () => {
    if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

    try {
      const JitsiAPI = window.JitsiMeetExternalAPI;
      apiRef.current = new JitsiAPI("meet.jit.si", {
        roomName: roomId,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName: userName, email: userEmail },
        configOverwrite: {
          startWithAudioMuted: !isModerator,
          startWithVideoMuted: !isModerator,
          disableDeepLinking: true,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Student",
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "closedcaptions", "desktop",
            "fullscreen", "fodeviceselection", "hangup", "chat",
            "recording", "raisehand", "filmstrip", "feedback",
            "stats", "shortcuts", "tileview", "whiteboard",
          ],
        },
      });

      apiRef.current.addEventListeners({
        videoConferenceJoined: () => setLoading(false),
        videoConferenceLeft: () => window.close(),
      });
    } catch (err) {
      setError("Could not initialize video call. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white font-semibold">{error}</p>
          <Link href="/student/dashboard">
            <Button variant="outline" className="text-white border-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center gap-3 shrink-0">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="font-medium text-sm">{sessionTitle}</p>
          <p className="text-xs text-slate-400">{courseTitle}</p>
        </div>
        {isModerator && (
          <span className="text-xs bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            Moderator
          </span>
        )}
      </div>

      {/* Jitsi container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-slate-300 text-sm">Connecting to live class...</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full min-h-[calc(100vh-52px)]" />
      </div>
    </div>
  );
}
