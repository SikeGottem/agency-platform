import { NextRequest, NextResponse } from 'next/server';
import {
  type UnsplashImage,
  type UnsplashSearchResponse,
  getCached,
  setCache,
  checkRateLimit,
  incrementRateLimit,
} from '@/lib/unsplash';

const UNSPLASH_API = 'https://api.unsplash.com';

export async function GET(request: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      {
        error: 'missing_api_key',
        message:
          'Unsplash API key not configured. Add UNSPLASH_ACCESS_KEY to .env.local. Get one at https://unsplash.com/developers',
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
      { error: 'rate_limited', message: 'Unsplash API rate limit reached. Try again later.' },
      { status: 429 }
    );
  }

  try {
    incrementRateLimit();
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&order_by=relevant`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Unsplash API error:', res.status, text);
      return NextResponse.json(
        { error: 'upstream_error', message: `Unsplash API returned ${res.status}` },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;

    const response: UnsplashSearchResponse = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images: data.results.map((photo: any): UnsplashImage => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.thumb,
        smallUrl: photo.urls.small,
        width: photo.width,
        height: photo.height,
        color: photo.color || '#333333',
        description: photo.alt_description || photo.description,
        photographer: {
          name: photo.user.name,
          username: photo.user.username,
          profileUrl: photo.user.links.html,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tags: (photo.tags || []).slice(0, 5).map((t: any) => t.title),
        likes: photo.likes,
        createdAt: photo.created_at,
      })),
      total: data.total,
      totalPages: data.total_pages,
    };

    setCache(cacheKey, response);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Unsplash fetch error:', err);
    return NextResponse.json(
      { error: 'fetch_error', message: 'Failed to fetch from Unsplash' },
      { status: 500 }
    );
  }
}
