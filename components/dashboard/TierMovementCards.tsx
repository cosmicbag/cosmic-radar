'use client';

import React from 'react';
import { TierMovement, CoinComparison } from '@/lib/compare';
import RankChangeCell from './RankChangeCell';

interface TierMovementCardsProps {
  tierMovement: TierMovement;
  tierLabel: string;
}

function CoinListItem({ coin, showRankChange = true }: { coin: CoinComparison; showRankChange?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center space-x-3">
        <div className="font-semibold text-text-secondary">
          #{coin.todayRank ?? coin.yesterdayRank}
        </div>
        <div>
          <div className="font-medium text-sm">{coin.name}</div>
          <div className="text-xs text-text-secondary">{coin.symbol}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {showRankChange && coin.rankChange !== null && (
          <RankChangeCell
            rankChange={coin.rankChange}
            yesterdayRank={coin.yesterdayRank}
          />
        )}
        {coin.todayChange24h !== null && (
          <span
            className={`text-sm font-medium ${
              coin.todayChange24h >= 0 ? 'text-positive' : 'text-negative'
            }`}
          >
            {coin.todayChange24h >= 0 ? '+' : ''}
            {coin.todayChange24h.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function TierMovementCards({
  tierMovement,
  tierLabel,
}: TierMovementCardsProps) {
  const maxDisplay = 10;
  
  // Safely access arrays with fallbacks
  const entered = tierMovement?.entered ?? [];
  const left = tierMovement?.left ?? [];
  const gainers = tierMovement?.gainers ?? [];
  const losers = tierMovement?.losers ?? [];
  
  // Check if we have rank-based data (entered/left will be empty if price-based)
  const hasRankData = entered.length > 0 || left.length > 0 ||
    (gainers.length > 0 && gainers[0].rankChange !== null);

  // If no rank data, show a simplified 2-column layout with just gainers/losers
  if (!hasRankData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-positive">
            Top Gainers in {tierLabel}
          </h3>
          <p className="text-xs text-text-secondary mb-3">Based on 24h price change</p>
          {gainers.length === 0 ? (
            <p className="text-text-secondary text-sm">No gainers</p>
          ) : (
            <div className="space-y-1">
              {gainers.slice(0, maxDisplay).map((coin) => (
                <CoinListItem key={coin.cmcId} coin={coin} showRankChange={false} />
              ))}
            </div>
          )}
        </div>

        {/* Losers */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-negative">
            Top Losers in {tierLabel}
          </h3>
          <p className="text-xs text-text-secondary mb-3">Based on 24h price change</p>
          {losers.length === 0 ? (
            <p className="text-text-secondary text-sm">No losers</p>
          ) : (
            <div className="space-y-1">
              {losers.slice(0, maxDisplay).map((coin) => (
                <CoinListItem key={coin.cmcId} coin={coin} showRankChange={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Entered */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-positive">
          Entered {tierLabel}
        </h3>
        {entered.length === 0 ? (
          <p className="text-text-secondary text-sm">No coins entered</p>
        ) : (
          <div className="space-y-1">
            {entered.slice(0, maxDisplay).map((coin) => (
              <CoinListItem key={coin.cmcId} coin={coin} />
            ))}
          </div>
        )}
      </div>

      {/* Left */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-negative">
          Left {tierLabel}
        </h3>
        {left.length === 0 ? (
          <p className="text-text-secondary text-sm">No coins left</p>
        ) : (
          <div className="space-y-1">
            {left.slice(0, maxDisplay).map((coin) => (
              <CoinListItem key={coin.cmcId} coin={coin} />
            ))}
          </div>
        )}
      </div>

      {/* Gainers */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-positive">
          Top Gainers in {tierLabel}
        </h3>
        {gainers.length === 0 ? (
          <p className="text-text-secondary text-sm">No gainers</p>
        ) : (
          <div className="space-y-1">
            {gainers.slice(0, maxDisplay).map((coin) => (
              <CoinListItem key={coin.cmcId} coin={coin} />
            ))}
          </div>
        )}
      </div>

      {/* Losers */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-negative">
          Top Losers in {tierLabel}
        </h3>
        {losers.length === 0 ? (
          <p className="text-text-secondary text-sm">No losers</p>
        ) : (
          <div className="space-y-1">
            {losers.slice(0, maxDisplay).map((coin) => (
              <CoinListItem key={coin.cmcId} coin={coin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
