import sharp from "sharp";
import fs from "fs";
import path from "path";

const sourcePath = path.resolve("public/logo.png");

if (!fs.existsSync(sourcePath)) {
  console.error("Error: public/logo.png not found!");
  process.exit(1);
}

/**
 * Creates standard 32x32 32-bit RGBA BMP-encoded ICO file.
 * Universally supported by Next.js Turbopack image decoder, Windows, Googlebot, and all browsers.
 */
async function generateBmpIco(src, width = 32, height = 32) {
  const { data } = await sharp(src)
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelData = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y; // bottom-up scanline
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      pixelData[dstIdx + 0] = data[srcIdx + 2]; // B
      pixelData[dstIdx + 1] = data[srcIdx + 1]; // G
      pixelData[dstIdx + 2] = data[srcIdx + 0]; // R
      pixelData[dstIdx + 3] = data[srcIdx + 3]; // A
    }
  }

  const andMaskSize = Math.ceil(width / 32) * 4 * height;
  const andMask = Buffer.alloc(andMaskSize, 0);

  const bih = Buffer.alloc(40);
  bih.writeUInt32LE(40, 0); // biSize
  bih.writeInt32LE(width, 4); // biWidth
  bih.writeInt32LE(height * 2, 8); // biHeight (XOR mask + AND mask)
  bih.writeUInt16LE(1, 12); // biPlanes
  bih.writeUInt16LE(32, 14); // biBitCount
  bih.writeUInt32LE(0, 16); // biCompression (BI_RGB)
  bih.writeUInt32LE(pixelData.length + andMaskSize, 20); // biSizeImage

  const imageBuffer = Buffer.concat([bih, pixelData, andMask]);

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(width, 0);
  entry.writeUInt8(height, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(imageBuffer.length, 8);
  entry.writeUInt32LE(22, 12); // offset 6 + 16 = 22

  return Buffer.concat([header, entry, imageBuffer]);
}

async function main() {
  console.log("Generating Google Search compliant business logo favicons for Elegant Trinketz...");

  // Generate individual PNG resolutions
  const [b48, b96, b180, b192, b512] = await Promise.all([
    sharp(sourcePath).resize(48, 48).png({ quality: 100 }).toBuffer(),
    sharp(sourcePath).resize(96, 96).png({ quality: 100 }).toBuffer(),
    sharp(sourcePath).resize(180, 180).png({ quality: 100 }).toBuffer(),
    sharp(sourcePath).resize(192, 192).png({ quality: 100 }).toBuffer(),
    sharp(sourcePath).resize(512, 512).png({ quality: 100 }).toBuffer(),
  ]);

  // Standard universal BMP ICO file
  const icoBuffer = await generateBmpIco(sourcePath, 32, 32);

  // Write to both public/ and src/app/
  fs.writeFileSync("public/favicon.ico", icoBuffer);
  fs.writeFileSync("src/app/favicon.ico", icoBuffer);
  console.log("✓ Saved public/favicon.ico and src/app/favicon.ico");

  // Google Search & Browser PNG favicons (Multiples of 48px square per Google Search guidelines)
  fs.writeFileSync("public/icon-48x48.png", b48);
  fs.writeFileSync("public/icon-96x96.png", b96);
  fs.writeFileSync("public/icon-192x192.png", b192);
  fs.writeFileSync("public/icon-512x512.png", b512);
  fs.writeFileSync("public/icon.png", b192);
  fs.writeFileSync("public/apple-touch-icon.png", b180);
  console.log("✓ Saved Google Search & PWA icons in public/");

  // App router specific icons
  fs.writeFileSync("src/app/icon.png", b512);
  fs.writeFileSync("src/app/apple-icon.png", b180);
  console.log("✓ Saved src/app/icon.png and src/app/apple-icon.png");

  console.log("All favicons generated successfully!");
}

main().catch((err) => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
