/**
 * Simple in-memory rate limiter.
 * For production with multiple instances, use Redis/Upstash instead.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

/**
 * Check if a request is within the rate limit.
 * @param key - Unique identifier (e.g., `resend:${userId}`)
 * @param limit - Max number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
