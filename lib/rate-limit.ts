export const MAX_MESSAGE_LENGTH = 8000;
export const MAX_CONTEXT_MESSAGES = 40;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 18; // 18 requests per minute per IP

interface RateLimitBucket {
  timestamps: number[];
}

const ipBuckets = new Map<string, RateLimitBucket>();

function cleanupExpiredBuckets(now: number) {
  if (ipBuckets.size < 500) return;
  for (const [ip, bucket] of ipBuckets.entries()) {
    const active = bucket.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) {
      ipBuckets.delete(ip);
    } else {
      bucket.timestamps = active;
    }
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const existing = ipBuckets.get(ip) ?? { timestamps: [] };
  const validTimestamps = existing.timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000)
    );
    ipBuckets.set(ip, { timestamps: validTimestamps });
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  validTimestamps.push(now);
  ipBuckets.set(ip, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - validTimestamps.length),
    retryAfterSeconds: 0,
  };
}

