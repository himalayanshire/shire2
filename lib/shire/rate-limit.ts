/**
 * Dependency-free in-memory sliding-window limiter. State resets on serverless
 * cold starts, which is fine as protection against casual spam.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
  ip?: string | null;
}): { success: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map never grows unbounded.
  if (buckets.size > 5000) {
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }

  const bucketKey = `${options.key}:${options.ip?.trim() || "global"}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return { success: true, retryAfterSeconds: Math.ceil(options.windowMs / 1000) };
  }
  if (bucket.count >= options.limit) {
    return { success: false, retryAfterSeconds: Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1) };
  }
  bucket.count += 1;
  return { success: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headers.get("x-real-ip");
}
