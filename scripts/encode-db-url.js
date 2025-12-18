#!/usr/bin/env node

/**
 * Helper script to properly encode database connection string
 * Usage: node scripts/encode-db-url.js "postgresql://postgres:PASSWORD@host:5432/db"
 */

const urlString = process.argv[2];

if (!urlString) {
  console.error('Usage: node scripts/encode-db-url.js "postgresql://postgres:PASSWORD@host:5432/db"');
  process.exit(1);
}

try {
  const url = new URL(urlString);
  const password = url.password;
  
  if (password) {
    // Encode the password
    const encodedPassword = encodeURIComponent(password);
    
    // Reconstruct URL with encoded password
    url.password = encodedPassword;
    
    console.log('\n✅ Encoded connection string:');
    console.log(url.toString());
    console.log('\n📋 Copy this to your .env.local file:\n');
    console.log(`DATABASE_URL=${url.toString()}\n`);
  } else {
    console.log('No password found in URL');
  }
} catch (error) {
  console.error('Error parsing URL:', error.message);
  process.exit(1);
}
