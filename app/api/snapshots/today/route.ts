/**
 * POST /api/snapshots/today
 * Creates or returns today's snapshot
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchTop200Listings } from '@/lib/cmcClient';
import { getTodayUTC } from '@/lib/date';

// Mark as dynamic
export const dynamic = 'force-dynamic';

async function createOrGetSnapshot() {
  try {
    const today = getTodayUTC();

    // Check if snapshot already exists for today
    let snapshot = await prisma.snapshot.findUnique({
      where: { date: today },
      include: { coins: true },
    });

    if (snapshot) {
      return NextResponse.json({
        message: 'Snapshot already exists for today',
        snapshot: {
          id: snapshot.id,
          date: snapshot.date.toISOString(),
          coinsCount: snapshot.coins.length,
        },
      });
    }

    // Fetch fresh data from CoinMarketCap
    const listings = await fetchTop200Listings();

    // Create new snapshot with coins
    snapshot = await prisma.snapshot.create({
      data: {
        date: today,
        coins: {
          create: listings.map((coin) => ({
            cmcId: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            rank: coin.cmc_rank,
            price: coin.price,
            marketCap: coin.market_cap,
            volume24h: coin.volume_24h,
            change24h: coin.percent_change_24h,
          })),
        },
      },
      include: { coins: true },
    });

    return NextResponse.json({
      message: 'Snapshot created successfully',
      snapshot: {
        id: snapshot.id,
        date: snapshot.date.toISOString(),
        coinsCount: snapshot.coins.length,
      },
    });
  } catch (error) {
    console.error('Error in /api/snapshots/today:', error);
    return NextResponse.json(
      { error: 'Failed to create or retrieve snapshot' },
      { status: 500 }
    );
  }
}

// Allow both GET and POST
export async function GET() {
  return createOrGetSnapshot();
}

export async function POST() {
  return createOrGetSnapshot();
}
