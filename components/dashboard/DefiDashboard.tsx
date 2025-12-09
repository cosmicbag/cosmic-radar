'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Lock, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface DexProtocol {
  name: string;
  displayName: string;
  totalVolume24h?: number;
  change_1d?: number;
  chains: string[];
  logo?: string;
}

interface Protocol {
  name: string;
  tvl: number;
  change_1d: number;
  chain: string;
  logo: string;
  category: string;
}

interface DefiDashboardProps {
  dexData: {
    totalVolume24h: number;
    change_1d: number;
    topProtocols: DexProtocol[];
  };
  tvlData: {
    total: number;
    topProtocols: Protocol[];
  };
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

export default function DefiDashboard({ dexData, tvlData }: DefiDashboardProps) {
  const [expandedProtocols, setExpandedProtocols] = useState(false);
  
  // Safety checks
  const safeDexData = {
    totalVolume24h: dexData?.totalVolume24h || 0,
    change_1d: dexData?.change_1d || 0,
    topProtocols: (dexData?.topProtocols || []).filter(p => p && p.name),
  };

  const safeTvlData = {
    total: tvlData?.total || 0,
    topProtocols: (tvlData?.topProtocols || []).filter(p => p && p.name),
  };

  return (
    <div className="space-y-6">
      {/* DeFi Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total DEX Volume */}
        <div className="card">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Activity className="w-4 h-4" />
            <span>Total DEX Volume (24h)</span>
          </div>
          <div className="text-2xl font-bold">{formatLargeNumber(safeDexData.totalVolume24h)}</div>
          <div className={`flex items-center gap-1 text-sm mt-2 ${
            safeDexData.change_1d >= 0 ? 'text-positive' : 'text-negative'
          }`}>
            {safeDexData.change_1d >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(safeDexData.change_1d).toFixed(2)}%</span>
          </div>
        </div>

        {/* Total TVL */}
        <div className="card">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Lock className="w-4 h-4" />
            <span>Total Value Locked</span>
          </div>
          <div className="text-2xl font-bold">{formatLargeNumber(safeTvlData.total)}</div>
          <div className="text-sm text-text-secondary mt-2">Across all protocols</div>
        </div>

        {/* Active Protocols - Top 10 by TVL */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Zap className="w-4 h-4" />
              <span>Active Protocols</span>
            </div>
            <span className="text-xl font-bold">{safeTvlData.topProtocols.length}+</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(expandedProtocols ? safeTvlData.topProtocols : safeTvlData.topProtocols.slice(0, 5)).map((protocol, index) => (
              <div key={protocol.name} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-text-secondary w-4">{index + 1}</span>
                  {protocol.logo && (
                    <img src={protocol.logo} alt={protocol.name} className="w-4 h-4 rounded-full flex-shrink-0" />
                  )}
                  <span className="truncate">{protocol.name}</span>
                </div>
                <span className="font-medium text-xs ml-2 flex-shrink-0">
                  {formatLargeNumber(protocol.tvl)}
                </span>
              </div>
            ))}
          </div>
          
          {safeTvlData.topProtocols.length > 5 && (
            <button
              onClick={() => setExpandedProtocols(!expandedProtocols)}
              className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              {expandedProtocols ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show top 5
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  View all {safeTvlData.topProtocols.length} protocols
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Top DEX Protocols */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Top DEX Protocols by Volume (24h)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">#</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">24h</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Protocol</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Volume (24h)</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Change</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Chains</th>
              </tr>
            </thead>
            <tbody>
              {safeDexData.topProtocols.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="w-8 h-8 animate-pulse" />
                      <p>Loading DEX protocols data...</p>
                      <p className="text-sm">Fetching from DeFi Llama API</p>
                    </div>
                  </td>
                </tr>
              ) : (
                safeDexData.topProtocols.map((protocol, index) => {
                  const change = protocol.change_1d || 0;
                  const isPositive = change >= 0;
                  
                  return (
                    <tr key={protocol.name} className="border-b border-border hover:bg-background transition-colors">
                      <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          {change !== 0 && (
                            <div className={`flex items-center justify-center w-12 h-6 rounded ${
                              isPositive ? 'bg-positive/10' : 'bg-negative/10'
                            }`}>
                              {isPositive ? (
                                <TrendingUp className={`w-4 h-4 text-positive`} />
                              ) : (
                                <TrendingDown className={`w-4 h-4 text-negative`} />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {protocol.logo && (
                            <img src={protocol.logo} alt={protocol.displayName} className="w-6 h-6 rounded-full" />
                          )}
                          <span className="font-medium">{protocol.displayName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatLargeNumber(protocol.totalVolume24h || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={isPositive ? 'text-positive' : 'text-negative'}>
                          {change !== 0 ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {protocol.chains.slice(0, 3).map(chain => (
                            <span key={chain} className="text-xs px-2 py-1 bg-background rounded-full">
                              {chain}
                            </span>
                          ))}
                          {protocol.chains.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-background rounded-full">
                              +{protocol.chains.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Protocols by TVL */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Top Protocols by Total Value Locked</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">#</th>
                <th className="text-center py-3 px-4 text-text-secondary font-medium">24h</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Protocol</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">TVL</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">TVL Change</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Chain</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {safeTvlData.topProtocols.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Lock className="w-8 h-8 animate-pulse" />
                      <p>Loading TVL data...</p>
                      <p className="text-sm">Fetching from DeFi Llama API</p>
                    </div>
                  </td>
                </tr>
              ) : (
                safeTvlData.topProtocols.map((protocol, index) => {
                  const change = protocol.change_1d;
                  const isPositive = change >= 0;
                
                return (
                  <tr key={protocol.name} className="border-b border-border hover:bg-background transition-colors">
                    <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        {change !== 0 && (
                          <div className={`flex items-center justify-center w-12 h-6 rounded ${
                            isPositive ? 'bg-positive/10' : 'bg-negative/10'
                          }`}>
                            {isPositive ? (
                              <TrendingUp className={`w-4 h-4 text-positive`} />
                            ) : (
                              <TrendingDown className={`w-4 h-4 text-negative`} />
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {protocol.logo && (
                          <img src={protocol.logo} alt={protocol.name} className="w-6 h-6 rounded-full" />
                        )}
                        <span className="font-medium">{protocol.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatLargeNumber(protocol.tvl)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={isPositive ? 'text-positive' : 'text-negative'}>
                        {change > 0 ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-background rounded-full">
                        {protocol.chain}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                        {protocol.category}
                      </span>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
