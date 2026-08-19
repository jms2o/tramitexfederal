import "server-only";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const maxBuckets = 10_000;
let requestsSinceCleanup = 0;

function cleanupExpiredBuckets(now: number) {
  requestsSinceCleanup += 1;
  if (requestsSinceCleanup < 250 && buckets.size < maxBuckets) return;
  requestsSinceCleanup = 0;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size >= maxBuckets) {
    const oldestKey = buckets.keys().next().value as string | undefined;
    if (oldestKey) buckets.delete(oldestKey);
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanupExpiredBuckets(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (current.count >= limit) return { allowed: false, retryAfterMs: current.resetAt - now };
  current.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function getRequestKey(forwardedFor: string | null, fallback: string) {
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip ? `ip:${ip}` : `fallback:${fallback}`;
}
