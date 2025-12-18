'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Wallet, 
  PieChart, 
  Star, 
  Link2, 
  Bell, 
  Settings, 
  TrendingUp,
  Plus,
  ArrowRight,
  Clock
} from 'lucide-react';
import Header from '@/components/layout/Header';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-card rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session.user?.name || 'Trader'}!
          </h1>
          <p className="text-text-secondary">
            Manage your portfolio, watchlists, and connections
          </p>
        </div>

        {/* Quick Stats (placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary text-sm">Portfolio Value</span>
              <PieChart className="w-5 h-5 text-accent" />
            </div>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-text-secondary mt-1">Add holdings to track</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary text-sm">24h Change</span>
              <TrendingUp className="w-5 h-5 text-positive" />
            </div>
            <div className="text-2xl font-bold text-text-secondary">--</div>
            <p className="text-xs text-text-secondary mt-1">No holdings yet</p>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary text-sm">Watchlist Items</span>
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-text-secondary mt-1">Add coins to watch</p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" />
                Portfolio
              </h2>
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-text-secondary mb-4">
              Track your crypto holdings and see your portfolio performance over time.
            </p>
            <div className="bg-background rounded-lg p-6 text-center">
              <Wallet className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <h3 className="font-medium mb-2">No Holdings Yet</h3>
              <p className="text-sm text-text-secondary mb-4">
                Add your first holding to start tracking your portfolio
              </p>
              <button 
                disabled
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent/50 text-white rounded-lg cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Holding
              </button>
            </div>
          </div>

          {/* Watchlist Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                Watchlist
              </h2>
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-text-secondary mb-4">
              Keep track of coins you're interested in without adding them to your portfolio.
            </p>
            <div className="bg-background rounded-lg p-6 text-center">
              <Star className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <h3 className="font-medium mb-2">Empty Watchlist</h3>
              <p className="text-sm text-text-secondary mb-4">
                Search for coins and add them to your watchlist
              </p>
              <button 
                disabled
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent/50 text-white rounded-lg cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add to Watchlist
              </button>
            </div>
          </div>

          {/* Connections Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-500" />
                Connections
              </h2>
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-text-secondary mb-4">
              Connect your wallets and exchange accounts for automatic tracking.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Wallet Connect</p>
                    <p className="text-xs text-text-secondary">Connect MetaMask, WalletConnect, etc.</p>
                  </div>
                </div>
                <button disabled className="text-text-secondary cursor-not-allowed">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Exchange APIs</p>
                    <p className="text-xs text-text-secondary">Binance, Coinbase, Kraken, etc.</p>
                  </div>
                </div>
                <button disabled className="text-text-secondary cursor-not-allowed">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-500" />
                Price Alerts
              </h2>
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-text-secondary mb-4">
              Set price alerts to get notified when coins hit your target prices.
            </p>
            <div className="bg-background rounded-lg p-6 text-center">
              <Bell className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <h3 className="font-medium mb-2">No Alerts Set</h3>
              <p className="text-sm text-text-secondary mb-4">
                Create alerts to stay on top of price movements
              </p>
              <button 
                disabled
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent/50 text-white rounded-lg cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Create Alert
              </button>
            </div>
          </div>
        </div>

        {/* Future Features Teaser */}
        <div className="mt-8 card bg-gradient-to-r from-accent/10 to-purple-500/10 border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-semibold">Coming Soon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h3 className="font-medium mb-1">CEX Listings Monitor</h3>
              <p className="text-sm text-text-secondary">
                Track new listings and delistings on major exchanges
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h3 className="font-medium mb-1">Portfolio Analytics</h3>
              <p className="text-sm text-text-secondary">
                Advanced charts and performance metrics
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h3 className="font-medium mb-1">Social Signals</h3>
              <p className="text-sm text-text-secondary">
                Track social sentiment and trending coins
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
