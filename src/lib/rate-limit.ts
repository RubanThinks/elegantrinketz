/**
 * In-Memory Sliding Window Rate Limiter for API Routes.
 * Protects critical endpoints (e.g. checkout, payment verification, order creation)
 * against bot storms, brute-force attempts, and sudden traffic spikes.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const cache = new Map<string, RateLimitRecord>();

// Automatically clean up stale IP records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of cache.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60_000);
      if (record.timestamps.length === 0) {
        cache.delete(key);
      }
    }
  }, 5 * 60_000).unref?.();
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds (default: 60,000ms = 1 minute) */
  windowMs?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks and updates rate limit for a given identifier (typically client IP).
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const windowMs = options.windowMs || 60_000;
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = cache.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    cache.set(identifier, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= options.limit) {
    const oldest = record.timestamps[0];
    const reset = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.max(1, reset),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extracts the real client IP from incoming Next.js Request headers.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}
