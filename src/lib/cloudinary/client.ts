import type { ProductMediaItem } from "@/types";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { recordPendingMedia } from "@/services/media/orphan-tracker";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file type and size before sending to Cloudinary.
 */
export function validateImageFile(file: File): UploadValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type (${file.type}). Allowed formats: JPG, PNG, WEBP, AVIF.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds maximum allowed limit of 10 MB.`,
    };
  }

  return { valid: true };
}
/**
 * Upload an image file directly to Cloudinary using signed authentication.
 * Keeps CLOUDINARY_API_SECRET safe on the Next.js server.
 */
export async function uploadToCloudinary(
  file: File,
  folder = "fashion-store/products",
  role: "primary" | "hover" | "gallery" = "gallery",
  sortOrder = 0,
  customAlt?: string
): Promise<ProductMediaItem> {
  // 1. Client-side pre-flight validation
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  // 2. Obtain current admin's Firebase ID token
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  let idToken = "";
  if (currentUser) {
    idToken = await currentUser.getIdToken();
  }

  // 3. Request upload signature from server API
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers,
    body: JSON.stringify({ folder }),
  });

  if (!signRes.ok) {
    const errorData = await signRes.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to acquire upload authorization signature");
  }

  const { signature, timestamp, apiKey, cloudName } = await signRes.json();

  // 4. Direct upload to Cloudinary API endpoint
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const uploadErr = await uploadRes.json().catch(() => ({}));
    throw new Error(
      uploadErr.error?.message || "Cloudinary upload failed. Please try again."
    );
  }

  const data = await uploadRes.json();

  // 5. Track uploaded asset in pending media registry to prevent orphans
  if (data.public_id && data.secure_url) {
    recordPendingMedia(data.public_id, data.secure_url, currentUser?.uid).catch(() => {});
  }

  // 6. Return strongly-typed ProductMediaItem
  return {
    id: data.asset_id || data.public_id,
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    alt: customAlt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
    role,
    sortOrder,
  };
}

/**
 * Delete a media asset from Cloudinary via server API.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    let idToken = "";
    if (currentUser) {
      idToken = await currentUser.getIdToken();
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const res = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers,
      body: JSON.stringify({ publicId }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("[deleteFromCloudinary] Request failed:", error);
    return false;
  }
}
