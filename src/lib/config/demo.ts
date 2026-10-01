/**
 * Global configuration controlling demo data fallback.
 *
 * CRITICAL PRODUCTION RULE:
 * Demo data must NEVER be returned automatically in production.
 * In development, demo data is ONLY used if NEXT_PUBLIC_USE_DEMO_DATA is explicitly "true".
 */
export const USE_DEMO_DATA =
  process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true" &&
  process.env.NODE_ENV !== "production";
