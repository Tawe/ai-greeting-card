#!/usr/bin/env node

/**
 * Script to set up S3 bucket for public image access
 * Run with: npm run setup-s3-bucket
 * 
 * This script:
 * 1. Sets bucket policy to allow public read access
 * 2. Verifies the configuration
 * 
 * Note: Requires s3:PutBucketPolicy permission
 */

import { config as dotenvConfig } from 'dotenv';
import { setupBucketPolicy } from '../lib/storage';

// Load .env.local file
dotenvConfig({ path: '.env.local' });

async function main() {
  console.log('🔧 Setting up S3 bucket for public access...\n');
  
  try {
    await setupBucketPolicy();
    console.log('\n✅ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to AWS S3 Console');
    console.log('   2. Select your bucket');
    console.log('   3. Go to Permissions tab');
    console.log('   4. Uncheck "Block all public access" (or configure appropriately)');
    console.log('   5. Verify bucket policy is set correctly');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error('\n💡 Manual setup required:');
    console.error('   1. Go to AWS S3 Console > Your Bucket > Permissions');
    console.error('   2. Uncheck "Block all public access"');
    console.error('   3. Add bucket policy (see docs/storage-setup.md)');
    process.exit(1);
  }
}

main();
