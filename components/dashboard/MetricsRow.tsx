'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity, Bitcoin, Coins, Gauge, Repeat } from 'lucide-react';
import { computePreviousFromChange, formatUsd } from '@/lib/utils';

interface MetricsRowProps {
  marketCap: number;
  volume24h: number;
  btcDominance: number;
  fearGreed: { value: number; label: string };
  altcoinSeason: { value: number; label: string; isEstimate?: boolean };
  marketCapChange24h?: number;
  volumeChange24h?: number;
  dexVolume24h?: number;
  dexVolumeChange24h?: number;
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

export default function MetricsRow({
  marketCap,
  volume24h,
  btcDominance,
  fearGreed,
  altcoinSeason,
  marketCapChange24h = 0,
  volumeChange24h = 0,
  dexVolume24h = 0,
  dexVolumeChange24h = 0,
}: MetricsRowProps) {
  const getFearGreedColor = (value: number) => {
    if (value <= 25) return 'text-negative';
    if (value <= 45) return 'text-warning';
    if (value <= 55) return 'text-text-secondary';
    if (value <= 75) return 'text-positive';
    return 'text-positive';
  };

  const renderChangeArrow = (change: number) => {
    if (change === 0) return null;
    const isPositive = change > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-positive' : 'text-negative'
      }`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{Math.abs(change).toFixed(2)}%</span>
      </div>
    );
  };

  const renderGauge = (value: number, color: string) => {
    return (
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-border"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(value / 100) * 175.93} 175.93`}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* Total Market Cap */}
      <div className="card">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Activity className="w-4 h-4" />
          <span>Total Market Cap</span>
        </div>
        <div className="text-2xl font-bold">{formatLargeNumber(marketCap)}</div>
        {renderChangeArrow(marketCapChange24h)}
        {(() => {
          const prevMarketCap = computePreviousFromChange(marketCap, marketCapChange24h);
          return prevMarketCap !== null && (
            <p className="mt-1 text-xs text-text-secondary">
              Prev day close:{' '}
              <span className="font-medium text-slate-300">
                {formatUsd(prevMarketCap)}
              </span>
            </p>
          );
        })()}
      </div>

      {/* 24h Volume */}
      <div className="card">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Activity className="w-4 h-4" />
          <span>24h Volume</span>
        </div>
        <div className="text-2xl font-bold">{formatLargeNumber(volume24h)}</div>
        {renderChangeArrow(volumeChange24h)}
        {(() => {
          const prevVolume = computePreviousFromChange(volume24h, volumeChange24h);
          return prevVolume !== null && (
            <p className="mt-1 text-xs text-text-secondary">
              Prev day volume:{' '}
              <span className="font-medium text-slate-300">
                {formatUsd(prevVolume)}
              </span>
            </p>
          );
        })()}
      </div>

      {/* BTC Dominance */}
      <div className="card">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Bitcoin className="w-4 h-4 text-orange-500" />
          <span>BTC Dominance</span>
        </div>
        {renderGauge(btcDominance, 'text-orange-500')}
      </div>

      {/* Fear & Greed Index */}
      <div className="card">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Gauge className="w-4 h-4" />
          <span>Fear & Greed</span>
        </div>
        {renderGauge(fearGreed.value, getFearGreedColor(fearGreed.value))}
        <div className="text-sm text-text-secondary text-center">{fearGreed.label}</div>
      </div>

      {/* Altcoin Season Index */}
      <div className="card">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Coins className="w-4 h-4 text-purple-500" />
          <span>Altcoin Season</span>
          {altcoinSeason.isEstimate && (
            <span className="text-xs px-1.5 py-0.5 bg-warning/10 text-warning rounded" title="Estimated from BTC dominance">
              Est.
            </span>
          )}
        </div>
        {renderGauge(altcoinSeason.value, 'text-purple-500')}
        <div className="text-sm text-text-secondary text-center">{altcoinSeason.label}</div>
      </div>

      {/* DEX Volume */}
      <div className="card">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Repeat className="w-4 h-4 text-blue-500" />
          <span>DEX Volume (24h)</span>
        </div>
        <div className="text-2xl font-bold">
          {dexVolume24h > 0 ? formatLargeNumber(dexVolume24h) : 'Loading...'}
        </div>
        {dexVolume24h > 0 && renderChangeArrow(dexVolumeChange24h)}
      </div>
    </div>
  );
}
