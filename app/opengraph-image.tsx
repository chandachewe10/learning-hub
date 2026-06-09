import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt    = "LearnHub — Learn. Grow. Succeed.";
export const size   = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.25)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.2)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            borderRadius: 999,
            padding: "12px 28px",
            marginBottom: 40,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🎓
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-1px",
            }}
          >
            LearnHub
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-2px",
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Learn.{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#a5b4fc,#c4b5fd)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Grow.
          </span>{" "}
          Succeed.
        </div>

        {/* Subheading */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(199,210,254,0.85)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Expert-led courses, live classes &amp; certificates — all in one place.
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 40,
          }}
        >
          {[
            ["500+", "Active Students"],
            ["500+", "Expert Courses"],
            ["300+", "Top Instructors"],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: "16px 32px",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#a5b4fc",
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 16, color: "rgba(199,210,254,0.7)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            color: "rgba(199,210,254,0.5)",
            letterSpacing: 1,
          }}
        >
          learnhub.macroit.org
        </div>
      </div>
    ),
    { ...size }
  );
}
