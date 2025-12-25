/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter to prevent API abuse
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetTime < now) {
    // First request or window expired
    store[key] = {
      count: 1,
      resetTime: now + config.interval,
    };
    return true;
  }

  if (store[key].count >= config.maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  store[key].count++;
  return true;
}

export function getRateLimitInfo(identifier: string, config: RateLimitConfig) {
  const now = Date.now();
  const key = identifier;
  const entry = store[key];

  if (!entry || entry.resetTime < now) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.interval,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}
