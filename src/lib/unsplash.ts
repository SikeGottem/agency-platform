// Unsplash API types and utilities

export interface UnsplashImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  smallUrl: string;
  width: number;
  height: number;
  color: string; // dominant color hex
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

export interface UnsplashSearchResponse {
  images: UnsplashImage[];
  total: number;
  totalPages: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: UnsplashSearchResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key: string): UnsplashSearchResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: UnsplashSearchResponse) {
  cache.set(key, { data, timestamp: Date.now() });
  // Evict old entries if cache gets large
  if (cache.size > 100) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

// Rate limit tracking
let requestCount = 0;
let windowStart = Date.now();
const RATE_LIMIT = 45; // slightly under 50 to be safe
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

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
