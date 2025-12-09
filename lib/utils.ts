/**
 * Utility functions for the app
 */

/**
 * Compute previous value from current value and percent change
 * Formula: previous = current / (1 + percentChange/100)
 */
export function computePreviousFromChange(
  current: number | null | undefined,
  percentChange24h: number | null | undefined
): number | null {
  if (
    current == null ||
    percentChange24h == null ||
    !isFinite(current) ||
    !isFinite(percentChange24h)
  ) return null;

  const factor = 1 + percentChange24h / 100;
  if (factor === 0) return null;

  return current / factor;
}

/**
 * Format large numbers as currency
 */
export function formatUsd(num: number | null): string {
  if (num === null || num === undefined) return '-';
  
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  
  return `$${num.toFixed(2)}`;
}

/**
 * Format percentage with sign
 */
export function formatPercent(num: number | null): string {
  if (num === null || num === undefined) return '-';
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}
