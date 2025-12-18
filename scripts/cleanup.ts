#!/usr/bin/env node

/**
 * Standalone cleanup script for expired cards
 * Run with: npm run cleanup
 * 
 * Useful for:
 * - Manual cleanup
 * - Testing cleanup logic
 * - Running in CI/CD pipelines
 */

import { config } from 'dotenv';
import { cleanupExpiredCards } from '../lib/cleanup';

// Load .env.local file
config({ path: '.env.local' });

async function main() {
  console.log('🧹 Starting cleanup job...\n');
  
  try {
    const startTime = Date.now();
    const result = await cleanupExpiredCards();
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Cleanup completed in ${duration}ms`);
    console.log(`   - Total expired cards found: ${result.totalExpired}`);
    console.log(`   - Successfully deleted: ${result.deleted}`);
    console.log(`   - Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.error('\n❌ Errors encountered:');
      result.errors.forEach(({ cardId, error }) => {
        console.error(`   - Card ${cardId}: ${error}`);
      });
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup job failed:', error);
    process.exit(1);
  }
}

main();
