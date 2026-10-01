/**
 * Phase 3.1 Cloudinary Security Route Validation Tests
 */

const ALLOWED_FOLDER_PREFIX = "fashion-store/";
const ALLOWED_SUB_NAMESPACES = [
  "fashion-store/products",
  "fashion-store/categories",
  "fashion-store/collections",
  "fashion-store/drafts",
];

function validateSignFolder(folder) {
  if (!folder) return { valid: false, error: "Empty folder" };
  const clean = folder.trim();
  if (clean.includes("..") || clean.startsWith("/") || clean.includes("\\")) {
    return { valid: false, error: "Path traversal characters forbidden" };
  }
  if (!clean.startsWith(ALLOWED_FOLDER_PREFIX)) {
    return { valid: false, error: "Must reside within fashion-store/ namespace" };
  }
  const isAllowedSub = ALLOWED_SUB_NAMESPACES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`)
  );
  if (!isAllowedSub) {
    return { valid: false, error: "Disallowed sub-namespace" };
  }
  return { valid: true };
}

function validateDeletePublicId(publicId) {
  if (!publicId || typeof publicId !== "string" || !publicId.trim()) {
    return { valid: false, error: "Invalid publicId" };
  }
  const clean = publicId.trim();
  if (
    clean.includes("..") ||
    clean.startsWith("/") ||
    clean.includes("\\") ||
    clean.includes("\0")
  ) {
    return { valid: false, error: "Traversal forbidden" };
  }
  if (!clean.startsWith(ALLOWED_FOLDER_PREFIX)) {
    return { valid: false, error: "Outside fashion-store namespace" };
  }
  return { valid: true };
}

const tests = [
  {
    name: "Sign API accepts valid product folder",
    input: "fashion-store/products/prod-123",
    expected: true,
    run: () => validateSignFolder("fashion-store/products/prod-123").valid,
  },
  {
    name: "Sign API accepts valid category folder",
    input: "fashion-store/categories/cat-1",
    expected: true,
    run: () => validateSignFolder("fashion-store/categories/cat-1").valid,
  },
  {
    name: "Sign API rejects path traversal (../)",
    input: "fashion-store/products/../../etc",
    expected: false,
    run: () => validateSignFolder("fashion-store/products/../../etc").valid,
  },
  {
    name: "Sign API rejects arbitrary outside namespaces",
    input: "another-store/images",
    expected: false,
    run: () => validateSignFolder("another-store/images").valid,
  },
  {
    name: "Delete API accepts valid fashion-store publicId",
    input: "fashion-store/products/prod-1/img1",
    expected: true,
    run: () => validateDeletePublicId("fashion-store/products/prod-1/img1").valid,
  },
  {
    name: "Delete API rejects outside publicId",
    input: "outside_asset_123",
    expected: false,
    run: () => validateDeletePublicId("outside_asset_123").valid,
  },
  {
    name: "Delete API rejects path traversal in publicId",
    input: "fashion-store/products/../root_asset",
    expected: false,
    run: () => validateDeletePublicId("fashion-store/products/../root_asset").valid,
  },
];

console.log("==================================================");
console.log("RUNNING CLOUDINARY API SECURITY TESTS");
console.log("==================================================");

let passed = 0;
for (const t of tests) {
  const result = t.run();
  if (result === t.expected) {
    passed++;
    console.log(`[PASS] ${t.name}`);
  } else {
    console.error(`[FAIL] ${t.name}`);
  }
}

console.log(`RESULTS: ${passed}/${tests.length} PASSED`);
if (passed !== tests.length) process.exit(1);
