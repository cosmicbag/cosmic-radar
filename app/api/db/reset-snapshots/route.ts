/**
 * POST /api/db/reset-snapshots
 * Drops and recreates snapshot tables
 * WARNING: This will delete all snapshot data
 * PROTECTED: Requires authentication
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

async function resetTables() {
  try {
    console.log('Dropping snapshot tables...');
    
    // Drop tables in correct order (child first, then parent)
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "CoinSnapshot" CASCADE');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Snapshot" CASCADE');
    
    console.log('Recreating snapshot tables...');
    
    // Recreate Snapshot table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Snapshot" (
        "id" SERIAL PRIMARY KEY,
        "date" TIMESTAMP(3) NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Recreate CoinSnapshot table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "CoinSnapshot" (
        "id" SERIAL PRIMARY KEY,
        "snapshotId" INTEGER NOT NULL,
        "cmcId" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "symbol" TEXT NOT NULL,
        "rank" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "marketCap" DOUBLE PRECISION NOT NULL,
        "volume24h" DOUBLE PRECISION NOT NULL,
        "change24h" DOUBLE PRECISION NOT NULL,
        CONSTRAINT "CoinSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") 
          REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    
    // Create indexes
    await prisma.$executeRawUnsafe('CREATE INDEX "Snapshot_date_idx" ON "Snapshot"("date")');
    await prisma.$executeRawUnsafe('CREATE INDEX "CoinSnapshot_snapshotId_idx" ON "CoinSnapshot"("snapshotId")');
    await prisma.$executeRawUnsafe('CREATE INDEX "CoinSnapshot_cmcId_idx" ON "CoinSnapshot"("cmcId")');
    await prisma.$executeRawUnsafe('CREATE INDEX "CoinSnapshot_rank_idx" ON "CoinSnapshot"("rank")');
    
    console.log('Tables recreated successfully');

    return NextResponse.json({
      message: 'Snapshot tables reset successfully',
      note: 'You can now create a new snapshot by visiting /api/snapshots/today'
    });
  } catch (error) {
    console.error('Error resetting snapshot tables:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to reset snapshot tables',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await requireAuth();
    return resetTables();
  } catch (error) {
    return unauthorizedResponse('Authentication required to reset database');
  }
}

export async function GET() {
  try {
    await requireAuth();
    return resetTables();
  } catch (error) {
    return unauthorizedResponse('Authentication required to reset database');
  }
}
