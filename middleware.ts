import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const key = ip;
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Different limits for different endpoints
    let limit = 100; // Default: 100 requests per minute
    let windowMs = 60000; // 1 minute

    // Stricter limits for expensive operations
    if (pathname.includes('/snapshots/create') || pathname.includes('/db/reset')) {
      limit = 5; // 5 requests per hour
      windowMs = 3600000; // 1 hour
    } else if (pathname.includes('/auth/register')) {
      limit = 10; // 10 registrations per hour
      windowMs = 3600000;
    } else if (pathname.includes('/search') || pathname.includes('/coin/')) {
      limit = 60; // 60 requests per minute
      windowMs = 60000;
    }

    if (!rateLimit(ip, limit, windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
