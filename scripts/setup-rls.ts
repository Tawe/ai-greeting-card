#!/usr/bin/env node

/**
 * Script to set up Row Level Security (RLS) policies in Supabase
 * Run with: npm run setup-rls
 */

import postgres from 'postgres';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local file
config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function setupRLS() {
  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    console.log('🔒 Setting up Row Level Security policies...\n');

    // Read and execute the SQL file
    const sqlFile = readFileSync(join(__dirname, '../drizzle/rls-policies.sql'), 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Row Level Security policies set up successfully!\n');
    console.log('📋 Policies created:');
    console.log('   - Public read access to active occasions');
    console.log('   - Public read access to published cards');
    console.log('   - Blocked all direct writes (API uses service role)\n');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error);
    await sql.end();
    process.exit(1);
  }
}

setupRLS();
