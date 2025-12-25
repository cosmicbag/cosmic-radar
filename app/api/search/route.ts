import { NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

const CMC_API_KEY = process.env.CMC_API_KEY;
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!CMC_API_KEY) {
      return NextResponse.json(
        { error: 'CMC API key not configured' },
        { status: 500 }
      );
    }

    // Cache the full coin map for 1 hour to reduce API calls
    const data = await withCache(
      'coin-map-full',
      async () => {
        const response = await fetch(
          `${CMC_BASE_URL}/cryptocurrency/map?limit=5000`,
          {
            headers: {
              'X-CMC_PRO_API_KEY': CMC_API_KEY,
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`CMC API error: ${response.status}`);
        }

        return response.json();
      },
      3600
    );
    
    // Filter results based on search query
    const searchLower = query.toLowerCase();
    const results = data.data
      .filter((coin: any) => 
        coin.name.toLowerCase().includes(searchLower) ||
        coin.symbol.toLowerCase().includes(searchLower)
      )
      .slice(0, 10) // Limit to top 10 results
      .map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.rank,
        slug: coin.slug,
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in /api/search:', error);
    return NextResponse.json(
      { error: 'Failed to search cryptocurrencies' },
      { status: 500 }
    );
  }
}
