import Header from '@/components/layout/Header';
import MetricsRow from '@/components/dashboard/MetricsRow';
import HubContainer from '@/components/hub/HubContainer';

export const dynamic = 'force-dynamic';

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  return 'http://localhost:3000';
}

async function getGlobalMetrics() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/global`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch global metrics');
  }

  return res.json();
}

async function getCompareData() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/snapshots/compare?date=today`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Compare data fetch failed:', errorText);
    throw new Error('Failed to fetch compare data');
  }

  return res.json();
}

async function getDefiData() {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/defi/overview`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        dex: { totalVolume24h: 0, change_1d: 0, topProtocols: [] },
        tvl: { total: 0, topProtocols: [] },
      };
    }

    return res.json();
  } catch (error) {
    return {
      dex: { totalVolume24h: 0, change_1d: 0, topProtocols: [] },
      tvl: { total: 0, topProtocols: [] },
    };
  }
}

export default async function HubPage() {
  try {
    const [globalMetrics, compareData, defiData] = await Promise.all([
      Promise.race([
        getGlobalMetrics(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]).catch(() => ({
        marketCap: 0,
        volume24h: 0,
        btcDominance: 0,
        fearGreed: { value: 50, label: 'Neutral' },
        altcoinSeason: { value: 50, label: 'Neutral' },
        marketCapChange24h: 0,
        volumeChange24h: 0,
      })),
      Promise.race([
        getCompareData(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]).catch(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
          date: today,
          previousDate: null,
          top200Today: [],
          newTop200: [],
          droppedFromTop200: [],
          gainers: [],
          losers: [],
          tiers: {
            t10: { entered: [], left: [], gainers: [], losers: [] },
            t50: { entered: [], left: [], gainers: [], losers: [] },
            t100: { entered: [], left: [], gainers: [], losers: [] },
            t200: { entered: [], left: [], gainers: [], losers: [] },
          },
        };
      }),
      Promise.race([
        getDefiData(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]).catch(() => ({
        dex: { totalVolume24h: 0, change_1d: 0, topProtocols: [] },
        tvl: { total: 0, topProtocols: [] },
      })),
    ]);

    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Hero Metrics Row */}
          <MetricsRow
            marketCap={globalMetrics.marketCap}
            volume24h={globalMetrics.volume24h}
            btcDominance={globalMetrics.btcDominance}
            fearGreed={globalMetrics.fearGreed}
            altcoinSeason={globalMetrics.altcoinSeason}
            marketCapChange24h={globalMetrics.marketCapChange24h}
            volumeChange24h={globalMetrics.volumeChange24h}
            dexVolume24h={defiData.dex?.totalVolume24h || 0}
            dexVolumeChange24h={defiData.dex?.change_1d || 0}
          />

          {/* Hub Container with Tabs */}
          <HubContainer compareData={compareData} defiData={defiData} />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading hub:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-bold mb-4 text-negative">Error Loading Hub</h2>
          <p className="text-text-secondary">
            Failed to load data. Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }
}
