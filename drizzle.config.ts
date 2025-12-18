import type { Config } from 'drizzle-kit';
import { config as dotenvConfig } from 'dotenv';

// Load .env.local file
dotenvConfig({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required. Please set it in .env.local');
}

// Validate URL format
try {
  new URL(databaseUrl);
} catch (error) {
  console.error('❌ Invalid DATABASE_URL format. Make sure the password is URL-encoded.');
  console.error('   Special characters in password (like /, %, @) must be encoded.');
  console.error('   Example: / becomes %2F, % becomes %25');
  throw error;
}

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
