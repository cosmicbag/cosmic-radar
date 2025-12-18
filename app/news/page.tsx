'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Flame, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/Header';
import { NewsItem, formatTimeAgo, NewsFilter } from '@/lib/cryptoPanicClient';

type FilterOption = {
  value: NewsFilter;
  label: string;
  icon: React.ReactNode;
};

const filterOptions: FilterOption[] = [
  { value: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
  { value: 'rising', label: 'Rising', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'bullish', label: 'Bullish', icon: <TrendingUp className="w-4 h-4 text-positive" /> },
  { value: 'bearish', label: 'Bearish', icon: <TrendingDown className="w-4 h-4 text-negative" /> },
  { value: 'important', label: 'Important', icon: <AlertCircle className="w-4 h-4" /> },
];

function getSentimentColor(votes: NewsItem['votes']): string {
  if (votes.positive > votes.negative) return 'bg-positive';
  if (votes.negative > votes.positive) return 'bg-negative';
  return 'bg-warning';
}

function getSentimentLabel(votes: NewsItem['votes']): string {
  if (votes.positive > votes.negative) return 'Bullish';
  if (votes.negative > votes.positive) return 'Bearish';
  return 'Neutral';
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NewsFilter>('hot');

  const fetchNews = async (selectedFilter: NewsFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/news?filter=${selectedFilter}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data.news || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(filter);
  }, [filter]);

  const handleRefresh = () => {
    fetchNews(filter);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Crypto News</h1>
            <p className="text-text-secondary mt-1">
              Latest cryptocurrency news from around the web
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === option.value
                  ? 'bg-accent text-white'
                  : 'bg-card border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-background rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-background rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-background rounded w-1/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-negative mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to load news</h3>
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card hover:border-accent transition-colors group"
              >
                {/* Header with sentiment */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getSentimentColor(item.votes)}`} />
                    <span className="text-xs text-text-secondary">
                      {getSentimentLabel(item.votes)}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-3 mb-3">
                  {item.title}
                </h3>

                {/* Currencies Tags */}
                {item.currencies && item.currencies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.currencies.slice(0, 3).map((currency) => (
                      <span
                        key={currency.code}
                        className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded"
                      >
                        {currency.code}
                      </span>
                    ))}
                    {item.currencies.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-background text-text-secondary rounded">
                        +{item.currencies.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-text-secondary mt-auto pt-3 border-t border-border">
                  <span className="truncate max-w-[60%]">{item.source.title}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(item.published_at)}
                  </div>
                </div>

                {/* Vote Stats */}
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-positive">👍 {item.votes.positive}</span>
                  <span className="text-negative">👎 {item.votes.negative}</span>
                  {item.votes.important > 0 && (
                    <span className="text-warning">⚡ {item.votes.important}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="card text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No news found</h3>
            <p className="text-text-secondary">
              Try a different filter or check back later
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
