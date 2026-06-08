import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      resource_type: "image",
      folder: "lms/images",
      transformation: [{ quality: "auto", fetch_format: "auto", width: 1280, crop: "limit" }],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
