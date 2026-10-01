import { NextResponse } from "next/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/server";
import { verifyAdminRequest, AuthError } from "@/lib/auth/server-auth";

const ALLOWED_NAMESPACE_PREFIX = "fashion-store/";

export async function POST(request: Request) {
  try {
    // 1. Verify caller has active Admin or Super Admin privileges
    const admin = await verifyAdminRequest(request);

    // 2. Parse and validate body
    let body: { publicId?: string } | null = null;
    try {
      body = (await request.json()) as { publicId?: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const publicId = body?.publicId;

    if (!publicId || typeof publicId !== "string" || !publicId.trim()) {
      return NextResponse.json(
        { error: "A valid publicId string must be provided." },
        { status: 400 }
      );
    }

    const cleanPublicId = publicId.trim();

    // Reject dangerous path traversal and null bytes
    if (
      cleanPublicId.includes("..") ||
      cleanPublicId.startsWith("/") ||
      cleanPublicId.includes("\\") ||
      cleanPublicId.includes("\0")
    ) {
      return NextResponse.json(
        { error: "Invalid publicId format. Path traversal characters are strictly forbidden." },
        { status: 400 }
      );
    }

    // Security check: only allow deletion of assets within our fashion-store folder
    if (!cleanPublicId.startsWith(ALLOWED_NAMESPACE_PREFIX)) {
      return NextResponse.json(
        { error: "Access denied. Cannot delete assets outside of the fashion-store/ namespace." },
        { status: 403 }
      );
    }

    const success = await deleteCloudinaryAsset(cleanPublicId);

    console.info(
      `[Cloudinary Delete] Admin ${admin.uid} (${admin.role}) deleted asset: ${cleanPublicId} (success: ${success})`
    );

    return NextResponse.json({ success });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[API Cloudinary Delete Error]:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to delete Cloudinary asset. Please try again." },
      { status: 500 }
    );
  }
}
