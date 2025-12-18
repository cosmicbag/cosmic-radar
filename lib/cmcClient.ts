/**
 * CoinMarketCap API Client
 * Handles all interactions with the CoinMarketCap Pro API
 */

const CMC_API_KEY = process.env.CMC_API_KEY;
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com';

if (!CMC_API_KEY) {
  console.warn('Warning: CMC_API_KEY is not set in environment variables');
}

interface CMCHeaders extends Record<string, string> {
  'X-CMC_PRO_API_KEY': string;
  'Accept': string;
}

function getHeaders(): CMCHeaders {
  if (!CMC_API_KEY) {
    throw new Error('CMC_API_KEY is not configured');
  }
  return {
    'X-CMC_PRO_API_KEY': CMC_API_KEY,
    'Accept': 'application/json',
  };
}

/**
 * Global Metrics Response Types
 */
export interface GlobalMetrics {
  marketCap: number;
  volume24h: number;
  btcDominance: number;
  activeCryptos?: number;
  marketCapChange24h?: number;
  volumeChange24h?: number;
}

/**
 * Fetch global crypto market metrics
 */
export async function fetchGlobalMetrics(): Promise<GlobalMetrics> {
  try {
    const url = new URL(`${CMC_BASE_URL}/v1/global-metrics/quotes/latest`);
    url.searchParams.append('convert', 'USD');

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const quote = data.data.quote.USD;

    return {
      marketCap: quote.total_market_cap,
      volume24h: quote.total_volume_24h,
      btcDominance: data.data.btc_dominance,
      activeCryptos: data.data.active_cryptocurrencies,
      marketCapChange24h: quote.total_market_cap_yesterday_percentage_change || 0,
      volumeChange24h: quote.total_volume_24h_yesterday_percentage_change || 0,
    };
  } catch (error) {
    console.error('Error fetching global metrics:', error);
    throw error;
  }
}

/**
 * Coin Listing Types
 */
export interface CoinListing {
  id: number;
  name: string;
  symbol: string;
  cmc_rank: number;
  price: number;
  market_cap: number;
  volume_24h: number;
  percent_change_24h: number;
}

/**
 * Fetch top 200 cryptocurrencies by market cap
 */
export async function fetchTop200Listings(): Promise<CoinListing[]> {
  try {
    const url = new URL(`${CMC_BASE_URL}/v1/cryptocurrency/listings/latest`);
    url.searchParams.append('start', '1');
    url.searchParams.append('limit', '200');
    url.searchParams.append('sort', 'market_cap');
    url.searchParams.append('convert', 'USD');

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      cmc_rank: coin.cmc_rank,
      price: coin.quote.USD.price,
      market_cap: coin.quote.USD.market_cap,
      volume_24h: coin.quote.USD.volume_24h,
      percent_change_24h: coin.quote.USD.percent_change_24h,
    }));
  } catch (error) {
    console.error('Error fetching top 200 listings:', error);
    throw error;
  }
}

/**
 * Fear & Greed Index Types
 */
export interface FearGreedIndex {
  value: number;
  label: string;
}

/**
 * Fetch Fear & Greed Index
 * Note: CoinMarketCap's Fear & Greed endpoint
 */
export async function fetchFearGreedIndex(): Promise<FearGreedIndex> {
  try {
    const url = new URL(`${CMC_BASE_URL}/v3/fear-and-greed/latest`);

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const fgData = data.data;

    // Map value to label
    let label = 'Neutral';
    if (fgData.value <= 25) label = 'Extreme Fear';
    else if (fgData.value <= 45) label = 'Fear';
    else if (fgData.value <= 55) label = 'Neutral';
    else if (fgData.value <= 75) label = 'Greed';
    else label = 'Extreme Greed';

    return {
      value: fgData.value,
      label,
    };
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    // Return fallback data if API fails
    return {
      value: 50,
      label: 'Neutral',
    };
  }
}

/**
 * Altcoin Season Index Types
 */
export interface AltcoinSeasonIndex {
  value: number;
  label: string;
  isEstimate?: boolean; // Flag to indicate if this is calculated vs from API
}

/**
 * Calculate Altcoin Season Index based on BTC dominance
 * This is a fallback calculation when the CMC API endpoint is unavailable
 * Formula: When BTC dominance is low, altcoins tend to outperform
 */
function calculateAltcoinSeasonFromDominance(btcDominance: number): AltcoinSeasonIndex {
  // Inverse relationship: lower BTC dominance = higher altcoin season score
  // BTC dominance typically ranges from 35% to 70%
  // Map this to 0-100 altcoin season index (inverted)
  const minDom = 35;
  const maxDom = 70;
  const clampedDom = Math.max(minDom, Math.min(maxDom, btcDominance));
  const value = Math.round(100 - ((clampedDom - minDom) / (maxDom - minDom)) * 100);
  
  let label = 'Neutral';
  if (value >= 75) label = 'Altcoin Season';
  else if (value >= 55) label = 'Alt Leaning';
  else if (value <= 25) label = 'Bitcoin Season';
  else if (value <= 45) label = 'BTC Leaning';
  
  return { value, label, isEstimate: true };
}

/**
 * Fetch Altcoin Season Index
 * Falls back to BTC dominance-based calculation if API unavailable
 */
export async function fetchAltcoinSeasonIndex(btcDominance?: number): Promise<AltcoinSeasonIndex> {
  try {
    const url = new URL(`${CMC_BASE_URL}/v3/cryptocurrency/altcoin-season-index`);

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      // API endpoint not available, use fallback calculation
      if (btcDominance !== undefined) {
        console.warn('Altcoin Season API unavailable, using BTC dominance calculation');
        return calculateAltcoinSeasonFromDominance(btcDominance);
      }
      throw new Error(`CMC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const indexValue = data?.data?.value ?? 50;

    // Determine label based on value
    let label = 'Neutral';
    if (indexValue >= 75) label = 'Altcoin Season';
    else if (indexValue >= 55) label = 'Alt Leaning';
    else if (indexValue <= 25) label = 'Bitcoin Season';
    else if (indexValue <= 45) label = 'BTC Leaning';

    return {
      value: indexValue,
      label,
      isEstimate: false,
    };
  } catch (error) {
    console.error('Error fetching Altcoin Season Index:', error);
    // Use BTC dominance fallback if available
    if (btcDominance !== undefined) {
      return calculateAltcoinSeasonFromDominance(btcDominance);
    }
    // Return neutral fallback
    return {
      value: 50,
      label: 'Neutral',
      isEstimate: true,
    };
  }
}
