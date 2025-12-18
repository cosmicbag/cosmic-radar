/**
 * Comparison logic for snapshot data
 * Computes rank changes, tier movements, gainers, and losers
 */

import { CoinSnapshot, Snapshot } from '@prisma/client';

export interface CoinComparison {
  cmcId: number;
  name: string;
  symbol: string;
  todayRank: number | null;
  yesterdayRank: number | null;
  todayPrice: number | null;
  todayMarketCap: number | null;
  todayVolume24h: number | null;
  todayChange24h: number | null;
  rankChange: number | null; // yesterdayRank - todayRank (positive = moved up)
}

export interface TierMovement {
  entered: CoinComparison[];
  left: CoinComparison[];
  gainers: CoinComparison[];
  losers: CoinComparison[];
}

export const emptyTierMovement: TierMovement = {
  entered: [],
  left: [],
  gainers: [],
  losers: [],
};

export interface CompareResponse {
  date: string;
  previousDate: string | null;
  top200Today: CoinComparison[];
  newTop200: CoinComparison[];
  droppedTop200: CoinComparison[];
  gainers: CoinComparison[];
  losers: CoinComparison[];
  tiers: {
    t10: TierMovement;
    t50: TierMovement;
    t100: TierMovement;
    t200: TierMovement;
  };
}

type SnapshotWithCoins = Snapshot & {
  coins: CoinSnapshot[];
};

/**
 * Build comparison data from two snapshots
 */
export function buildCompareResponse(
  todaySnapshot: SnapshotWithCoins,
  yesterdaySnapshot: SnapshotWithCoins | null
): CompareResponse {
  // Create maps for quick lookup
  const todayMap = new Map<number, CoinSnapshot>();
  const yesterdayMap = new Map<number, CoinSnapshot>();

  todaySnapshot.coins.forEach((coin) => todayMap.set(coin.cmcId, coin));
  yesterdaySnapshot?.coins.forEach((coin) => yesterdayMap.set(coin.cmcId, coin));

  // Get all unique coin IDs
  const allCoinIds = new Set([...todayMap.keys(), ...yesterdayMap.keys()]);

  // Build comparison objects
  const comparisons: CoinComparison[] = [];

  allCoinIds.forEach((cmcId) => {
    const today = todayMap.get(cmcId);
    const yesterday = yesterdayMap.get(cmcId);

    const todayRank = today?.rank ?? null;
    const yesterdayRank = yesterday?.rank ?? null;

    let rankChange: number | null = null;
    if (todayRank !== null && yesterdayRank !== null) {
      rankChange = yesterdayRank - todayRank; // Positive = moved up
    }

    comparisons.push({
      cmcId,
      name: today?.name ?? yesterday?.name ?? '',
      symbol: today?.symbol ?? yesterday?.symbol ?? '',
      todayRank,
      yesterdayRank,
      todayPrice: today?.price ?? null,
      todayMarketCap: today?.marketCap ?? null,
      todayVolume24h: today?.volume24h ?? null,
      todayChange24h: today?.change24h ?? null,
      rankChange,
    });
  });

  // Filter and sort
  const top200Today = comparisons
    .filter((c) => c.todayRank !== null)
    .sort((a, b) => (a.todayRank ?? 0) - (b.todayRank ?? 0));

  const newTop200 = comparisons.filter(
    (c) => c.todayRank !== null && c.yesterdayRank === null
  );

  const droppedTop200 = comparisons.filter(
    (c) => c.yesterdayRank !== null && c.todayRank === null
  );

  const gainers = comparisons
    .filter((c) => c.rankChange !== null && c.rankChange > 0)
    .sort((a, b) => (b.rankChange ?? 0) - (a.rankChange ?? 0));

  const losers = comparisons
    .filter((c) => c.rankChange !== null && c.rankChange < 0)
    .sort((a, b) => Math.abs(a.rankChange ?? 0) - Math.abs(b.rankChange ?? 0));

  // Compute tier movements with fallback
  const t10 = computeTierMovement(comparisons, 1, 10);
  const t50 = computeTierMovement(comparisons, 1, 50);
  const t100 = computeTierMovement(comparisons, 1, 100);
  const t200 = computeTierMovement(comparisons, 1, 200);

  const tiers = {
    t10: t10 ?? emptyTierMovement,
    t50: t50 ?? emptyTierMovement,
    t100: t100 ?? emptyTierMovement,
    t200: t200 ?? emptyTierMovement,
  };

  return {
    date: todaySnapshot.date.toISOString().split('T')[0],
    previousDate: yesterdaySnapshot
      ? yesterdaySnapshot.date.toISOString().split('T')[0]
      : null,
    top200Today,
    newTop200,
    droppedTop200,
    gainers,
    losers,
    tiers,
  };
}

/**
 * Compute tier movement for a specific rank range
 */
function computeTierMovement(
  comparisons: CoinComparison[],
  minRank: number,
  maxRank: number
): TierMovement {
  const isInTier = (rank: number | null) =>
    rank !== null && rank >= minRank && rank <= maxRank;

  const entered = comparisons.filter(
    (c) => isInTier(c.todayRank) && !isInTier(c.yesterdayRank)
  );

  const left = comparisons.filter(
    (c) => !isInTier(c.todayRank) && isInTier(c.yesterdayRank)
  );

  const gainers = comparisons
    .filter(
      (c) =>
        isInTier(c.todayRank) &&
        isInTier(c.yesterdayRank) &&
        c.rankChange !== null &&
        c.rankChange > 0
    )
    .sort((a, b) => (b.rankChange ?? 0) - (a.rankChange ?? 0));

  const losers = comparisons
    .filter(
      (c) =>
        isInTier(c.todayRank) &&
        isInTier(c.yesterdayRank) &&
        c.rankChange !== null &&
        c.rankChange < 0
    )
    .sort((a, b) => Math.abs(a.rankChange ?? 0) - Math.abs(b.rankChange ?? 0));

  return {
    entered,
    left,
    gainers,
    losers,
  };
}

/**
 * Build a fallback response from live CMC data when no snapshot exists
 * This ensures Top 200 table always has data to display
 * Uses 24h price change as a proxy for gainers/losers when no historical rank data exists
 */
export function buildLiveFallbackResponse(
  liveListings: any[],
  targetDate: Date
): CompareResponse {
  const top200Today: CoinComparison[] = liveListings.map((coin) => ({
    cmcId: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    todayRank: coin.cmc_rank,
    yesterdayRank: null, // No historical data
    todayPrice: coin.price,
    todayMarketCap: coin.market_cap,
    todayVolume24h: coin.volume_24h,
    todayChange24h: coin.percent_change_24h,
    rankChange: null, // No historical data
  }));

  // When no historical data exists, use 24h price change to determine gainers/losers
  // This provides useful data even without snapshots
  const sortedByChange = [...top200Today].filter(c => c.todayChange24h !== null);
  
  const gainers = sortedByChange
    .filter(c => (c.todayChange24h ?? 0) > 0)
    .sort((a, b) => (b.todayChange24h ?? 0) - (a.todayChange24h ?? 0));
  
  const losers = sortedByChange
    .filter(c => (c.todayChange24h ?? 0) < 0)
    .sort((a, b) => (a.todayChange24h ?? 0) - (b.todayChange24h ?? 0));

  // Build tier movements based on 24h change within each tier
  const buildTierFromChange = (minRank: number, maxRank: number): TierMovement => {
    const tierCoins = top200Today.filter(
      c => c.todayRank !== null && c.todayRank >= minRank && c.todayRank <= maxRank
    );
    const tierGainers = tierCoins
      .filter(c => (c.todayChange24h ?? 0) > 0)
      .sort((a, b) => (b.todayChange24h ?? 0) - (a.todayChange24h ?? 0));
    const tierLosers = tierCoins
      .filter(c => (c.todayChange24h ?? 0) < 0)
      .sort((a, b) => (a.todayChange24h ?? 0) - (b.todayChange24h ?? 0));
    
    return {
      entered: [],
      left: [],
      gainers: tierGainers,
      losers: tierLosers,
    };
  };

  return {
    date: targetDate.toISOString().split('T')[0],
    previousDate: null,
    top200Today,
    newTop200: [],
    droppedTop200: [],
    gainers,
    losers,
    tiers: {
      t10: buildTierFromChange(1, 10),
      t50: buildTierFromChange(1, 50),
      t100: buildTierFromChange(1, 100),
      t200: buildTierFromChange(1, 200),
    },
  };
}
