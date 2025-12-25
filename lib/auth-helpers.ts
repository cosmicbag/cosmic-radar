/**
 * Authentication Helper Functions
 * Utilities for checking authentication and authorization
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Check if the current request is authenticated
 * Returns the session if authenticated, throws error if not
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(resetTime?: number) {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': '0',
  };
  
  if (resetTime) {
    headers['X-RateLimit-Reset'] = Math.ceil(resetTime / 1000).toString();
  }
  
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers }
  );
}
