/**
 * GET /api/defi/overview
 * Returns DeFi overview including DEX volume and TVL metrics
 */

import { NextResponse } from 'next/server';
import { fetchDexOverview, fetchProtocolsTVL } from '@/lib/defiLlamaClient';
import { withCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Fetching DeFi data from DeFi Llama...');
    
    // Cache DeFi data for 10 minutes
    const [dexOverview, protocols] = await Promise.all([
      withCache('defi-dex-overview', () => fetchDexOverview(), 600).catch(err => {
        console.error('DEX overview fetch failed:', err);
        return { protocols: [], totalVolume24h: 0, totalVolume7d: 0, change_1d: 0, change_7d: 0 };
      }),
      withCache('defi-protocols-tvl', () => fetchProtocolsTVL(), 600).catch(err => {
        console.error('Protocols TVL fetch failed:', err);
        return [];
      }),
    ]);

    console.log('DeFi data fetched successfully:', {
      dexVolume: dexOverview.totalVolume24h,
      protocolsCount: protocols.length
    });

    // Calculate total TVL
    const totalTVL = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0);

    // Get top 10 protocols by TVL
    const topProtocols = protocols
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 10);

    return NextResponse.json({
      dex: {
        totalVolume24h: dexOverview.totalVolume24h,
        totalVolume7d: dexOverview.totalVolume7d,
        change_1d: dexOverview.change_1d,
        change_7d: dexOverview.change_7d,
        topProtocols: dexOverview.protocols
          .filter(p => !p.disabled && p.totalVolume24h)
          .sort((a, b) => (b.totalVolume24h || 0) - (a.totalVolume24h || 0))
          .slice(0, 10),
      },
      tvl: {
        total: totalTVL,
        topProtocols,
      },
    });
  } catch (error) {
    console.error('Error in /api/defi/overview:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch DeFi overview',
        dex: { totalVolume24h: 0, change_1d: 0, topProtocols: [] },
        tvl: { total: 0, topProtocols: [] }
      },
      { status: 200 } // Return 200 with empty data instead of 500
    );
  }
}
