"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Users, Clock, Loader2, AlertCircle } from "lucide-react";
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
  dispose: () => void;
  addEventListener: (event: string, handler: () => void) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiAPI;
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
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const initJitsi = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      // Fetch JWT from our server
      const res = await fetch("/api/live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: roomId, isModerator }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to get token");
      }

      const { jwt, appId } = await res.json();

      // Load Jitsi External API script if not already loaded
      if (!window.JitsiMeetExternalAPI) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://8x8.vc/vpaas-magic-cookie-e67909039e694b2394b32435264574e4/external_api.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Jitsi API script"));
          document.head.appendChild(script);
        });
      }

      if (!containerRef.current) return;

      // Cleanup any previous instance
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }

      // The full room name for JaaS: appId/roomId
      const fullRoomName = `${appId}/${roomId}`;

      apiRef.current = new window.JitsiMeetExternalAPI("8x8.vc", {
        roomName: fullRoomName,
        jwt,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName: userName,
          email: userEmail,
        },
        configOverwrite: {
          startWithAudioMuted: !isModerator,
          startWithVideoMuted: !isModerator,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          toolbarButtons: [
            "microphone", "camera", "closedcaptions", "desktop",
            "fullscreen", "fodeviceselection", "hangup", "profile",
            "chat", "recording", "sharedvideo", "settings",
            "raisehand", "videoquality", "filmstrip", "tileview",
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Participant",
          TOOLBAR_ALWAYS_VISIBLE: true,
        },
      });

      apiRef.current.addEventListener("videoConferenceJoined", () => {
        setStatus("ready");
      });

      // Fallback: mark ready after 8s even if event doesn't fire
      setTimeout(() => setStatus((s) => (s === "loading" ? "ready" : s)), 8000);
    } catch (err) {
      console.error("[JaaS]", err);
      setError(err instanceof Error ? err.message : "Failed to start meeting");
      setStatus("error");
    }
  }, [roomId, isModerator, userName, userEmail]);

  useEffect(() => {
    initJitsi();
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [initJitsi]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-3 shrink-0 z-10">
        <Link href={isModerator ? "/instructor/live-sessions" : "/student/dashboard"}>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{sessionTitle}</p>
          <p className="text-[11px] text-slate-500 truncate">{courseTitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {time.toLocaleTimeString()}
          </div>
          {isModerator && (
            <Button
              onClick={copyLink}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {copied
                ? <><Check className="w-3 h-3 text-green-400 mr-1" />Copied</>
                : <><Copy className="w-3 h-3 mr-1" /><Users className="w-3 h-3 mr-1" />Invite</>
              }
            </Button>
          )}
        </div>
      </div>

      {/* Meeting area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Jitsi iframe container — always rendered so the API can attach to it */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading overlay */}
        {status === "loading" && (
          <div
            className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 z-20 cursor-pointer"
            onClick={() => setStatus("ready")}
          >
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Connecting to live class…</p>
            <p className="text-slate-600 text-xs">Click anywhere to dismiss</p>
          </div>
        )}

        {/* Error overlay */}
        {status === "error" && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 z-20 p-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white font-semibold text-center">Could not start meeting</p>
            <p className="text-slate-400 text-sm text-center max-w-sm">{error}</p>
            <Button onClick={initJitsi} variant="gradient" size="sm">
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
