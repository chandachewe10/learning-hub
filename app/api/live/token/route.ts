import { auth } from "@/auth";
import { SignJWT, importPKCS8 } from "jose";
import { NextResponse } from "next/server";

const APP_ID = process.env.JAAS_APP_ID!;
const KEY_ID = process.env.JAAS_KEY_ID!;
const PRIVATE_KEY_PEM = process.env.JAAS_PRIVATE_KEY!;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomName, isModerator } = await req.json();
  if (!roomName) {
    return NextResponse.json({ error: "roomName is required" }, { status: 400 });
  }

  try {
    const pemKey = PRIVATE_KEY_PEM.replace(/\\n/g, "\n");
    const privateKey = await importPKCS8(pemKey, "RS256");

    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({
      aud: "jitsi",
      iss: "chat",
      sub: APP_ID,
      room: "*",
      context: {
        user: {
          id: session.user.id,
          name: session.user.name ?? "Participant",
          email: session.user.email ?? "",
          avatar: session.user.image ?? "",
          moderator: isModerator ? "true" : "false",
        },
        features: {
          livestreaming: "false",
          recording: isModerator ? "true" : "false",
          transcription: "false",
          "outbound-call": "false",
        },
      },
    })
      .setProtectedHeader({ alg: "RS256", kid: KEY_ID, typ: "JWT" })
      .setIssuedAt(now - 10)
      .setExpirationTime(now + 7200) // 2 hours
      .setNotBefore(now - 10)
      .sign(privateKey);

    return NextResponse.json({ jwt, appId: APP_ID, roomName });
  } catch (err) {
    console.error("[JaaS token error]", err);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
