// Pexels API types and utilities

export interface PexelsImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  smallUrl: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };
  tags: string[];
  likes: number;
  createdAt: string;
}

export interface PexelsSearchResponse {
  images: PexelsImage[];
  total: number;
  totalPages: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: PexelsSearchResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key: string): PexelsSearchResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: PexelsSearchResponse) {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 100) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

// Rate limit tracking (Pexels: 200 req/hour)
let requestCount = 0;
let windowStart = Date.now();
const RATE_LIMIT = 190;
const RATE_WINDOW = 60 * 60 * 1000;

export function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - windowStart > RATE_WINDOW) {
    requestCount = 0;
    windowStart = now;
  }
  return requestCount < RATE_LIMIT;
}

export function incrementRateLimit() {
  requestCount++;
}
