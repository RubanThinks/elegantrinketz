import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #fff1f2 40%, #ffe4e6 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          padding: "48px",
        }}
      >
        {/* Subtle decorative borders */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "24px",
            border: "2px solid rgba(225, 29, 72, 0.15)",
            borderRadius: "24px",
          }}
        />

        {/* Central Logo Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4af37, #f6e27a, #b8860b)",
            padding: "4px",
            boxShadow: "0 12px 32px rgba(212, 175, 55, 0.3)",
            marginBottom: "24px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${siteConfig.url}/logo.png`}
            alt={siteConfig.name}
            width="172"
            height="172"
            style={{
              width: "172px",
              height: "172px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          {siteConfig.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#e11d48",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          {siteConfig.tagline}
        </div>

        {/* Prominent Products Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(225, 29, 72, 0.2)",
            borderRadius: "9999px",
            padding: "10px 24px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
          }}
        >
          <span style={{ fontSize: "16px", color: "#4b5563", fontWeight: 500 }}>
            Side Cut Kurtis · Umbrella Kurtis · 3 Piece Sets · Straight Pants · Shimmer Leggings
          </span>
        </div>

        {/* Location & Contact Bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "15px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          <span>📍 Salem, Tamil Nadu</span>
          <span>•</span>
          <span>WhatsApp: +91 78452 03893</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
