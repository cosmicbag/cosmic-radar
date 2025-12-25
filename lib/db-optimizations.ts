/**
 * Database optimization utilities
 * Provides helper functions for efficient database queries
 */

import { prisma } from './prisma';

/**
 * Get user with minimal data for authentication checks
 */
export async function getUserMinimal(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

/**
 * Get user watchlists with coin count only (no full coin data)
 */
export async function getUserWatchlistsSummary(userId: string) {
  return prisma.watchlist.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      coinIds: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Get active alerts only (optimized query)
 */
export async function getActiveAlerts(userId: string) {
  return prisma.alert.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      coinId: true,
      coinSymbol: true,
      alertType: true,
      targetValue: true,
      lastTriggered: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get user holdings with summary data
 * NOTE: Holding model exists in schema but table not yet migrated
 * Uncomment when holdings feature is implemented
 */
export async function getUserHoldingsSummary(userId: string) {
  // TODO: Uncomment when Holding table is migrated
  // return prisma.holding.findMany({
  //   where: { userId },
  //   select: {
  //     id: true,
  //     coinId: true,
  //     symbol: true,
  //     name: true,
  //     quantity: true,
  //     costBasis: true,
  //   },
  //   orderBy: { updatedAt: 'desc' },
  // });
  
  console.warn('Holdings feature not yet implemented');
  return [];
}

/**
 * Batch update alert trigger times
 */
export async function batchUpdateAlertTriggers(alertIds: string[]) {
  return prisma.alert.updateMany({
    where: {
      id: { in: alertIds },
    },
    data: {
      lastTriggered: new Date(),
    },
  });
}
