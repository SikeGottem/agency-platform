import { NextRequest, NextResponse } from 'next/server';
import {
  type PexelsImage,
  type PexelsSearchResponse,
  getCached,
  setCache,
  checkRateLimit,
  incrementRateLimit,
} from '@/lib/pexels';

const PEXELS_API = 'https://api.pexels.com/v1';

export async function GET(request: NextRequest) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'missing_api_key',
        message:
          'Pexels API key not configured. Add PEXELS_API_KEY to .env.local. Get one at https://pexels.com/api',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 30);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Check cache
  const cacheKey = `search:${query}:${page}:${perPage}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Check rate limit
  if (!checkRateLimit()) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Pexels API rate limit reached. Try again later.' },
      { status: 429 }
    );
  }

  try {
    incrementRateLimit();
    const res = await fetch(
      `${PEXELS_API}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Pexels API error:', res.status, text);
      return NextResponse.json(
        { error: 'upstream_error', message: `Pexels API returned ${res.status}` },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;

    const response: PexelsSearchResponse = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images: data.photos.map((photo: any): PexelsImage => ({
        id: String(photo.id),
        url: photo.src.large,
        thumbnailUrl: photo.src.tiny,
        smallUrl: photo.src.small,
        width: photo.width,
        height: photo.height,
        color: photo.avg_color || '#333333',
        description: photo.alt || null,
        photographer: {
          name: photo.photographer,
          username: photo.photographer.toLowerCase().replace(/\s+/g, '-'),
          profileUrl: photo.photographer_url,
        },
        tags: [], // Pexels doesn't return tags in search
        likes: 0,
        createdAt: new Date().toISOString(),
      })),
      total: data.total_results,
      totalPages: Math.ceil(data.total_results / perPage),
    };

    setCache(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Pexels fetch error:', err);
    return NextResponse.json(
      { error: 'fetch_error', message: 'Failed to fetch from Pexels' },
      { status: 500 }
    );
  }
}
