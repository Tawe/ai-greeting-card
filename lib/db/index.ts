import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from '../config';

if (!config.database.url) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Type assertion: we've checked above that config.database.url exists
const databaseUrl: string = config.database.url;

// Use global singleton pattern to prevent multiple connection pools
// This is especially important in Next.js with hot reloading
declare global {
  // eslint-disable-next-line no-var
  var __dbClient: postgres.Sql | undefined;
}

// Configure postgres client with connection pooling
// Supabase Session mode has a limit, so we need to manage connections carefully
const client =
  global.__dbClient ??
  postgres(databaseUrl, {
    prepare: false,
    max: 5, // Maximum number of connections in the pool (conservative for Supabase Session mode)
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout
  });

if (process.env.NODE_ENV !== 'production') {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema });

export * from './schema';
