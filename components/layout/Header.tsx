'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, LogOut, BarChart3, Bell, Wallet, Search, Loader2, Newspaper, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CoinDetailsModal from '@/components/search/CoinDetailsModal';

interface SearchResult {
  id: number;
  name: string;
  symbol: string;
  rank: number;
  slug: string;
}

export default function Header() {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.results || []);
            setShowResults(true);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCoinClick = (coinId: number) => {
    setSelectedCoinId(coinId);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: App Title with Mascot + Nav */}
          <div className="flex items-center space-x-2 sm:space-x-6 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 bg-contain bg-center bg-no-repeat flex-shrink-0"
                style={{ backgroundImage: 'url(/mascot.png)' }}
                aria-label="Cosmic Radar Mascot"
              />
              <h1 className="text-lg sm:text-2xl font-bold text-green-500">
                Cosmic Radar
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/hub"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Hub</span>
              </Link>
              <Link
                href="/news"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              >
                <Newspaper className="w-4 h-4" />
                <span className="text-sm font-medium">News</span>
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Center: Search - hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex flex-1 max-w-xs md:max-w-md mx-2 md:mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all cryptocurrencies..."
                className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder-text-secondary"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary animate-spin" />
              )}

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleCoinClick(result.id)}
                      className="w-full px-4 py-3 text-left hover:bg-background transition-colors border-b border-border last:border-b-0 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-text-secondary">{result.symbol}</div>
                      </div>
                      <div className="text-sm text-text-secondary">#{result.rank}</div>
                    </button>
                  ))}
                </div>
              )}

              {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg p-4 z-50">
                  <p className="text-sm text-text-secondary text-center">No results found</p>
                </div>
              )}
            </form>
          </div>

          {/* Right: Search Icon (mobile) & Currency & User */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="sm:hidden p-2 hover:bg-background rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:block px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium">
              USD
            </div>
            
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-background animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-card transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="User"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium hidden md:block">
                    {session.user?.name || 'Account'}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-text-secondary">{session.user?.email}</p>
                      </div>
                      <div className="py-2">
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-background flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          My Watchlists
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-background flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Price Alerts
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-background flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Connect Wallet
                        </button>
                      </div>
                      <div className="border-t border-border py-2">
                        <button
                          onClick={() => signOut()}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-background flex items-center gap-2 text-negative"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Search Overlay */}
    {showMobileSearch && (
      <div className="sm:hidden fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button
            onClick={() => {
              setShowMobileSearch(false);
              setSearchQuery('');
              setShowResults(false);
            }}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cryptocurrencies..."
              className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder-text-secondary"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary animate-spin" />
            )}
          </div>
        </div>

        {/* Mobile Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="divide-y divide-border">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    handleCoinClick(result.id);
                    setShowMobileSearch(false);
                  }}
                  className="w-full px-4 py-4 text-left hover:bg-card transition-colors flex items-center justify-between active:bg-card/80"
                >
                  <div>
                    <div className="font-medium text-base">{result.name}</div>
                    <div className="text-sm text-text-secondary">{result.symbol}</div>
                  </div>
                  <div className="text-sm text-text-secondary">#{result.rank}</div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim().length >= 2 && !searching ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary">No results found</p>
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary">Type to search...</p>
            </div>
          ) : null}
        </div>
      </div>
    )}

    {/* Coin Details Modal */}
    {selectedCoinId && (
      <CoinDetailsModal
        coinId={selectedCoinId}
        onClose={() => setSelectedCoinId(null)}
      />
    )}
  </>
  );
}
