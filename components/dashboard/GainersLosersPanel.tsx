'use client';

import React, { useState } from 'react';
import { CoinComparison } from '@/lib/compare';
import RankChangeCell from './RankChangeCell';

interface GainersLosersPanelProps {
  gainers: CoinComparison[];
  losers: CoinComparison[];
  showPriceChange?: boolean; // When true, shows 24h price change instead of rank change
}

export default function GainersLosersPanel({
  gainers,
  losers,
  showPriceChange = false,
}: GainersLosersPanelProps) {
  const [showAllGainers, setShowAllGainers] = useState(false);
  const [showAllLosers, setShowAllLosers] = useState(false);

  const displayLimit = 20;
  
  // Determine if we're showing rank changes or price changes
  // If first gainer has no rankChange, we're showing price-based data
  const isRankBased = gainers.length > 0 && gainers[0].rankChange !== null;

  // Empty state
  if (gainers.length === 0 && losers.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Gainers & Losers</h3>
        <p className="text-text-secondary">No data available. Please check your API connection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gainers */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 text-positive">
          {isRankBased ? 'Rank Gainers' : '24h Price Gainers'} (Top 200)
        </h3>
        {!isRankBased && (
          <p className="text-xs text-text-secondary mb-3">
            Based on 24h price change • Rank data available after 2+ days
          </p>
        )}
        <div className="space-y-2">
          {(showAllGainers ? gainers : gainers.slice(0, displayLimit)).map(
            (coin) => (
              <div
                key={coin.cmcId}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="font-semibold text-text-secondary w-12">
                    #{coin.todayRank}
                  </div>
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-sm text-text-secondary">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {isRankBased && (
                    <RankChangeCell
                      rankChange={coin.rankChange}
                      yesterdayRank={coin.yesterdayRank}
                    />
                  )}
                  {coin.todayChange24h !== null && (
                    <span
                      className={`text-sm font-medium ${
                        coin.todayChange24h >= 0
                          ? 'text-positive'
                          : 'text-negative'
                      }`}
                    >
                      {coin.todayChange24h >= 0 ? '+' : ''}
                      {coin.todayChange24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        {gainers.length > displayLimit && (
          <button
            onClick={() => setShowAllGainers(!showAllGainers)}
            className="mt-4 text-accent hover:underline text-sm"
          >
            {showAllGainers
              ? 'Show less'
              : `View all ${gainers.length} gainers`}
          </button>
        )}
      </div>

      {/* Losers */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 text-negative">
          {isRankBased ? 'Rank Losers' : '24h Price Losers'} (Top 200)
        </h3>
        {!isRankBased && (
          <p className="text-xs text-text-secondary mb-3">
            Based on 24h price change • Rank data available after 2+ days
          </p>
        )}
        <div className="space-y-2">
          {(showAllLosers ? losers : losers.slice(0, displayLimit)).map(
            (coin) => (
              <div
                key={coin.cmcId}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="font-semibold text-text-secondary w-12">
                    #{coin.todayRank}
                  </div>
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-sm text-text-secondary">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {isRankBased && (
                    <RankChangeCell
                      rankChange={coin.rankChange}
                      yesterdayRank={coin.yesterdayRank}
                    />
                  )}
                  {coin.todayChange24h !== null && (
                    <span
                      className={`text-sm font-medium ${
                        coin.todayChange24h >= 0
                          ? 'text-positive'
                          : 'text-negative'
                      }`}
                    >
                      {coin.todayChange24h >= 0 ? '+' : ''}
                      {coin.todayChange24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        {losers.length > displayLimit && (
          <button
            onClick={() => setShowAllLosers(!showAllLosers)}
            className="mt-4 text-accent hover:underline text-sm"
          >
            {showAllLosers ? 'Show less' : `View all ${losers.length} losers`}
          </button>
        )}
      </div>
    </div>
  );
}
