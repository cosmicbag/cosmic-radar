/**
 * GET /api/snapshots/compare?date=YYYY-MM-DD
 * Compares snapshot for given date with previous day
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildCompareResponse, buildLiveFallbackResponse } from '@/lib/compare';
import { getTodayUTC, parseDateString, getDaysAgo, formatDateString } from '@/lib/date';
import { fetchTop200Listings } from '@/lib/cmcClient';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  // Determine target date
  let targetDate: Date;
  if (!dateParam || dateParam === 'today') {
    targetDate = getTodayUTC();
  } else {
    try {
      targetDate = parseDateString(dateParam);
    } catch {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
  }

  // Try database first, fall back to live CMC data on any error
  try {
    // Find snapshot for target date
    const todaySnapshot = await prisma.snapshot.findUnique({
      where: { date: targetDate },
      include: { coins: true },
    });

    // FALLBACK: If no snapshot exists, fetch live data from CMC
    if (!todaySnapshot) {
      console.log('No snapshot found, fetching live CMC data as fallback');
      const liveListings = await fetchTop200Listings();
      const fallbackResponse = buildLiveFallbackResponse(liveListings, targetDate);
      return NextResponse.json(fallbackResponse);
    }

    // Find previous snapshot (yesterday or closest before)
    const previousDate = getDaysAgo(targetDate, 1);
    let yesterdaySnapshot = await prisma.snapshot.findUnique({
      where: { date: previousDate },
      include: { coins: true },
    });

    // If no snapshot for exact previous day, find the most recent one before target
    if (!yesterdaySnapshot) {
      yesterdaySnapshot = await prisma.snapshot.findFirst({
        where: {
          date: {
            lt: targetDate,
          },
        },
        orderBy: {
          date: 'desc',
        },
        include: { coins: true },
      });
    }

    // Build comparison response
    const compareResponse = buildCompareResponse(todaySnapshot, yesterdaySnapshot);
    return NextResponse.json(compareResponse);

  } catch (dbError) {
    // Database error - fall back to live CMC data
    console.warn('Database error, falling back to live CMC data:', dbError);
    
    try {
      const liveListings = await fetchTop200Listings();
      const fallbackResponse = buildLiveFallbackResponse(liveListings, targetDate);
      return NextResponse.json(fallbackResponse);
    } catch (cmcError) {
      console.error('Both database and CMC API failed:', cmcError);
      return NextResponse.json(
        { error: 'Failed to fetch data from database and CMC API' },
        { status: 500 }
      );
    }
  }
}
