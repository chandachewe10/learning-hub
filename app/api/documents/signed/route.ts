import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents/signed?url=<cloudinary_raw_url>
 *
 * Extracts the public_id from a Cloudinary raw URL, generates a signed
 * delivery URL, then redirects the client to it.  This bypasses any
 * CDN-level access restrictions on unsigned raw assets.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const publicId = extractPublicId(rawUrl);

    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      secure: true,
      sign_url: true,
    });

    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch {
    return NextResponse.json(
      { error: "Invalid Cloudinary URL" },
      { status: 400 }
    );
  }
}

/**
 * Extracts the Cloudinary public_id (including file extension) from a
 * standard secure delivery URL.
 *
 * Example input:
 *   https://res.cloudinary.com/mycloud/raw/upload/v1781022530/lms/documents/abc123.pdf
 * Example output:
 *   lms/documents/abc123.pdf
 */
function extractPublicId(url: string): string {
  // Strip query string / hash
  const clean = url.split("?")[0].split("#")[0];

  // Match the path after /upload/ (optionally skipping version segment vNNN/)
  const match = clean.match(/\/(?:raw|image|video)\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) throw new Error("Cannot parse public_id from URL");

  return match[1]; // e.g. "lms/documents/abc123.pdf"
}
