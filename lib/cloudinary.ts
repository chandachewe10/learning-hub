import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadVideo(file: Buffer | string, folder = "lms/videos") {
  const result = await cloudinary.uploader.upload(file as string, {
    resource_type: "video",
    folder,
    eager: [{ streaming_profile: "hd", format: "m3u8" }],
    eager_async: true,
  });
  return result;
}

export async function uploadImage(file: Buffer | string, folder = "lms/images") {
  const result = await cloudinary.uploader.upload(file as string, {
    resource_type: "image",
    folder,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return result;
}

export async function uploadDocument(file: Buffer | string, folder = "lms/documents") {
  const result = await cloudinary.uploader.upload(file as string, {
    resource_type: "raw",
    folder,
  });
  return result;
}

export async function deleteMedia(publicId: string, resourceType: "video" | "image" | "raw" = "video") {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
  return result;
}

export function getSecureVideoUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    sign_url: true,
    type: "authenticated",
  });
}

export function getSignedUploadParams(folder: string, resourceType: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, resource_type: resourceType },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
}
