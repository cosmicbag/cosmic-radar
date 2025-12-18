'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Layers } from 'lucide-react';
import { CompareResponse } from '@/lib/compare';
import TopCoinsTable from '@/components/dashboard/TopCoinsTable';
import GainersLosersPanel from '@/components/dashboard/GainersLosersPanel';
import TierMovementCards from '@/components/dashboard/TierMovementCards';
import DefiDashboard from '@/components/dashboard/DefiDashboard';

type TabId = 'overview' | 'gainers' | 'losers' | 'top200' | 'defi';
type TierFilter = 't10' | 't50' | 't100' | 't200';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
  { id: 'gainers', label: 'Gainers', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'losers', label: 'Losers', icon: <TrendingDown className="w-4 h-4" /> },
  { id: 'top200', label: 'Top 200', icon: <BarChart3 className="w-4 h-4" /> },
];

const tierOptions: { value: TierFilter; label: string }[] = [
  { value: 't10', label: 'Top 10' },
  { value: 't50', label: 'Top 50' },
  { value: 't100', label: 'Top 100' },
  { value: 't200', label: 'Top 200' },
];

interface HubContainerProps {
  compareData: CompareResponse;
  defiData: any;
}

export default function HubContainer({ compareData, defiData }: HubContainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [tierFilter, setTierFilter] = useState<TierFilter>('t50');

  // Filter data based on tier
  const getFilteredData = (tier: TierFilter) => {
    const maxRank = tier === 't10' ? 10 : tier === 't50' ? 50 : tier === 't100' ? 100 : 200;
    return {
      gainers: (compareData.gainers || []).filter(c => (c.todayRank ?? 999) <= maxRank),
      losers: (compareData.losers || []).filter(c => (c.todayRank ?? 999) <= maxRank),
      top200: (compareData.top200Today || []).filter(c => (c.todayRank ?? 999) <= maxRank),
    };
  };

  const filteredData = getFilteredData(tierFilter);
  const tierLabels = { t10: 'Top 10', t50: 'Top 50', t100: 'Top 100', t200: 'Top 200' };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'bg-card border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tier Filter (for gainers/losers tabs) */}
      {(activeTab === 'gainers' || activeTab === 'losers' || activeTab === 'overview') && (
        <div className="flex flex-wrap gap-2">
          {tierOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTierFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tierFilter === option.value
                  ? 'bg-accent/20 text-accent border border-accent'
                  : 'bg-background border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tier Movement Cards */}
          <TierMovementCards
            tierMovement={compareData.tiers?.[tierFilter] ?? { entered: [], left: [], gainers: [], losers: [] }}
            tierLabel={tierLabels[tierFilter]}
          />
          
          {/* Quick Gainers/Losers Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-positive flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Gainers ({tierLabels[tierFilter]})
              </h3>
              <div className="space-y-2">
                {filteredData.gainers.slice(0, 5).map((coin) => (
                  <div key={coin.cmcId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary w-8">#{coin.todayRank}</span>
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-text-secondary">{coin.symbol}</div>
                      </div>
                    </div>
                    <span className="text-positive font-medium">
                      +{(coin.todayChange24h ?? 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
                {filteredData.gainers.length === 0 && (
                  <p className="text-text-secondary text-sm">No gainers data available</p>
                )}
              </div>
              {filteredData.gainers.length > 5 && (
                <button
                  onClick={() => setActiveTab('gainers')}
                  className="mt-4 text-accent text-sm hover:underline"
                >
                  View all {filteredData.gainers.length} gainers →
                </button>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-negative flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Top Losers ({tierLabels[tierFilter]})
              </h3>
              <div className="space-y-2">
                {filteredData.losers.slice(0, 5).map((coin) => (
                  <div key={coin.cmcId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary w-8">#{coin.todayRank}</span>
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-text-secondary">{coin.symbol}</div>
                      </div>
                    </div>
                    <span className="text-negative font-medium">
                      {(coin.todayChange24h ?? 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
                {filteredData.losers.length === 0 && (
                  <p className="text-text-secondary text-sm">No losers data available</p>
                )}
              </div>
              {filteredData.losers.length > 5 && (
                <button
                  onClick={() => setActiveTab('losers')}
                  className="mt-4 text-accent text-sm hover:underline"
                >
                  View all {filteredData.losers.length} losers →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gainers' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-positive">
            Price Gainers ({tierLabels[tierFilter]})
          </h2>
          {filteredData.gainers.length > 0 ? (
            <GainersLosersPanel 
              gainers={filteredData.gainers} 
              losers={[]} 
            />
          ) : (
            <p className="text-text-secondary">No gainers data available. Check your API connection.</p>
          )}
        </div>
      )}

      {activeTab === 'losers' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-negative">
            Price Losers ({tierLabels[tierFilter]})
          </h2>
          {filteredData.losers.length > 0 ? (
            <GainersLosersPanel 
              gainers={[]} 
              losers={filteredData.losers} 
            />
          ) : (
            <p className="text-text-secondary">No losers data available. Check your API connection.</p>
          )}
        </div>
      )}

      {activeTab === 'top200' && (
        <TopCoinsTable data={compareData.top200Today || []} />
      )}

      {activeTab === 'defi' && (
        <DefiDashboard dexData={defiData?.dex} tvlData={defiData?.tvl} />
      )}
    </div>
  );
}
