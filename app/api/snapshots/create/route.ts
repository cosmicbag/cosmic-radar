/**
 * POST /api/snapshots/create?date=YYYY-MM-DD
 * Creates a snapshot for a specific date
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchTop200Listings } from '@/lib/cmcClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'date parameter required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    // Parse the date
    const date = new Date(dateStr + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format (use YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Check if snapshot already exists
    let snapshot = await prisma.snapshot.findUnique({
      where: { date },
      include: { coins: true },
    });

    if (snapshot) {
      return NextResponse.json({
        message: 'Snapshot already exists for this date',
        snapshot: {
          id: snapshot.id,
          date: snapshot.date.toISOString(),
          coinsCount: snapshot.coins.length,
        },
      });
    }

    // Fetch fresh data
    const listings = await fetchTop200Listings();

    // Create snapshot
    snapshot = await prisma.snapshot.create({
      data: {
        date,
        coins: {
          create: listings.map((coin) => ({
            cmcId: parseInt(String(coin.id)),
            name: String(coin.name),
            symbol: String(coin.symbol),
            rank: parseInt(String(coin.cmc_rank)),
            price: parseFloat(String(coin.price)) || 0,
            marketCap: parseFloat(String(coin.market_cap)) || 0,
            volume24h: parseFloat(String(coin.volume_24h)) || 0,
            change24h: parseFloat(String(coin.percent_change_24h)) || 0,
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
    console.error('Error creating snapshot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create snapshot',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
