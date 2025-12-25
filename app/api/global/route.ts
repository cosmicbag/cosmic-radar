/**
 * GET /api/global
 * Returns global crypto market metrics including Fear & Greed and Altcoin Season indices
 */

import { NextResponse } from 'next/server';
import {
  fetchGlobalMetrics,
  fetchFearGreedIndex,
  fetchAltcoinSeasonIndex,
} from '@/lib/cmcClient';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Cache global metrics for 5 minutes to reduce API calls
    const globalMetrics = await withCache(
      'global-metrics',
      () => fetchGlobalMetrics(),
      300
    );
    
    // Then fetch other indices, passing BTC dominance for fallback calculation
    const [fearGreed, altcoinSeason] = await Promise.all([
      fetchFearGreedIndex(),
      fetchAltcoinSeasonIndex(globalMetrics.btcDominance),
    ]);

    return NextResponse.json({
      marketCap: globalMetrics.marketCap,
      volume24h: globalMetrics.volume24h,
      btcDominance: globalMetrics.btcDominance,
      activeCryptos: globalMetrics.activeCryptos,
      marketCapChange24h: globalMetrics.marketCapChange24h,
      volumeChange24h: globalMetrics.volumeChange24h,
      fearGreed,
      altcoinSeason,
    });
  } catch (error) {
    console.error('Error in /api/global:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global metrics' },
      { status: 500 }
    );
  }
}
