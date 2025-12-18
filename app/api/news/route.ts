/**
 * GET /api/news
 * Fetches latest crypto news from CryptoPanic
 * Query params:
 *   - filter: 'rising' | 'hot' | 'bullish' | 'bearish' | 'important' (default: 'hot')
 *   - limit: number (default: 30)
 */

import { NextResponse } from 'next/server';
import { fetchCryptoNews, NewsFilter } from '@/lib/cryptoPanicClient';

export const dynamic = 'force-dynamic';

const validFilters: NewsFilter[] = ['rising', 'hot', 'bullish', 'bearish', 'important', 'saved', 'lol'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterParam = searchParams.get('filter') || 'hot';
    const limitParam = searchParams.get('limit');
    
    // Validate filter
    const filter: NewsFilter = validFilters.includes(filterParam as NewsFilter) 
      ? (filterParam as NewsFilter) 
      : 'hot';
    
    // Validate limit
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 30, 1), 50) : 30;
    
    const news = await fetchCryptoNews(limit, filter);
    
    return NextResponse.json({
      news,
      count: news.length,
      filter,
    });
  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', news: [] },
      { status: 500 }
    );
  }
}
