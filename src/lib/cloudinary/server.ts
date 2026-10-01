import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side using server-only secrets
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface CloudinarySignatureParams {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
}

/**
 * Generate a secure signed payload for direct browser-to-Cloudinary uploads.
 * This keeps the API secret strictly server-side while allowing efficient direct client uploads.
 */
export function generateUploadSignature(folder: string): CloudinarySignatureParams {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error(
      "Cloudinary credentials missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  // Parameters to sign (sorted alphabetically by key)
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    timestamp,
    folder,
    signature,
    apiKey,
    cloudName,
  };
}

/**
 * Delete a Cloudinary image by its publicId.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("[CloudinaryServer] Error deleting asset:", error);
    return false;
  }
}
