/**
 * Cloudinary image abstraction layer.
 *
 * Components should use these helpers instead of constructing Cloudinary URLs directly.
 * This allows easy migration or configuration changes later.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb" | "limit";
  gravity?: "auto" | "face" | "center";
  aspectRatio?: string;
}

/**
 * Build a Cloudinary delivery URL with transformations.
 *
 * @param publicId - The Cloudinary public ID of the asset
 * @param options - Transformation parameters
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!CLOUD_NAME) {
    // Fallback: return the publicId as-is (useful for demo/placeholder images)
    return publicId;
  }

  const transforms: string[] = [];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  if (options.format) transforms.push(`f_${options.format}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  if (options.aspectRatio) transforms.push(`ar_${options.aspectRatio}`);

  const transformStr = transforms.length > 0 ? `/${transforms.join(",")}` : "";

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload${transformStr}/${publicId}`;
}

/**
 * Generate a responsive image srcSet for Cloudinary images.
 */
export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280],
  options: Omit<CloudinaryTransformOptions, "width"> = {}
): string {
  return widths
    .map((w) => `${getCloudinaryUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(", ");
}

/**
 * Get a product thumbnail URL.
 */
export function getProductThumbnail(publicId: string, size = 400): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: Math.round(size * (4 / 3)),
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
}

/**
 * Get a category image URL.
 */
export function getCategoryImage(publicId: string, size = 300): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}
