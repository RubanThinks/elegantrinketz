import { NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary/server";
import { verifyAdminRequest, AuthError } from "@/lib/auth/server-auth";

// Allowed folder namespace patterns
const ALLOWED_FOLDER_PREFIX = "fashion-store/";
const ALLOWED_SUB_NAMESPACES = [
  "fashion-store/products",
  "fashion-store/categories",
  "fashion-store/collections",
  "fashion-store/drafts",
];

export async function POST(request: Request) {
  try {
    // 1. Verify caller has active Admin or Super Admin credentials
    const admin = await verifyAdminRequest(request);

    // 2. Parse and validate body
    let body: { folder?: string } | null = null;
    try {
      body = (await request.json()) as { folder?: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const folder = (body?.folder || "fashion-store/products").trim();

    // 3. Security checks on folder destination
    // Reject path traversal and absolute paths
    if (folder.includes("..") || folder.startsWith("/") || folder.includes("\\")) {
      return NextResponse.json(
        { error: "Invalid folder path. Path traversal characters are strictly forbidden." },
        { status: 400 }
      );
    }

    // Must strictly start with our allowed namespace
    if (!folder.startsWith(ALLOWED_FOLDER_PREFIX)) {
      return NextResponse.json(
        { error: "Invalid upload destination. Must reside within the fashion-store/ namespace." },
        { status: 400 }
      );
    }

    // Validate that folder targets a recognized sub-namespace
    const isAllowedSubNamespace = ALLOWED_SUB_NAMESPACES.some((prefix) =>
      folder === prefix || folder.startsWith(`${prefix}/`)
    );

    if (!isAllowedSubNamespace) {
      return NextResponse.json(
        {
          error:
            "Invalid folder destination. Allowed targets are fashion-store/products, categories, collections, or drafts.",
        },
        { status: 400 }
      );
    }

    // 4. Generate Cloudinary signature server-side
    const signData = generateUploadSignature(folder);

    // Log action safely without leaking credentials
    console.info(
      `[Cloudinary Sign] Generated upload signature for admin ${admin.uid} (${admin.role}) -> folder: ${folder}`
    );

    return NextResponse.json({
      signature: signData.signature,
      timestamp: signData.timestamp,
      apiKey: signData.apiKey,
      cloudName: signData.cloudName,
      folder,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[API Cloudinary Sign Error]:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to generate upload authorization. Please try again." },
      { status: 500 }
    );
  }
}
