/**
 * API helper utilities for consistent error handling and responses
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

export function createErrorResponse(error: ApiError) {
  return NextResponse.json(
    { 
      error: error.message,
      code: error.code,
    },
    { status: error.statusCode }
  );
}

export function createSuccessResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Wrapper for API routes with consistent error handling
 */
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<NextResponse> {
  try {
    const result = await handler();
    return createSuccessResponse(result);
  } catch (error) {
    console.error(errorMessage, error);
    const message = error instanceof Error ? error.message : errorMessage;
    return createErrorResponse({
      message,
      statusCode: 500,
    });
  }
}

/**
 * Validate required query parameters
 */
export function validateQueryParams(
  searchParams: URLSearchParams,
  required: string[]
): { valid: boolean; missing?: string[] } {
  const missing = required.filter(param => !searchParams.get(param));
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}
