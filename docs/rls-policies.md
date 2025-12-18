# Row Level Security (RLS) Policies

This document explains the Row Level Security policies configured for the AI Card Platform.

## Overview

Row Level Security (RLS) is enabled on all tables to provide defense-in-depth security. Even if database credentials are exposed, RLS policies prevent unauthorized access.

## How It Works

- **API Access**: Your Next.js API uses the service role connection string, which bypasses RLS policies (this is intentional - your API needs full access)
- **Direct Database Access**: If someone gets direct database access, RLS policies restrict what they can do
- **Public Access**: Future frontend Supabase client usage would be restricted by these policies

## Policies Configured

### `occasions` Table

**Public Read (Active Only)**
- ✅ Anyone can read occasions where `is_active = true`
- ❌ Cannot read inactive occasions
- ❌ Cannot insert, update, or delete occasions

**Use Case**: Homepage needs to show available occasions (currently just Christmas)

### `cards` Table

**Public Read (Published & Not Expired)**
- ✅ Anyone can read cards where `status = 'published'` AND `expires_at > NOW()`
- ❌ Cannot read draft cards
- ❌ Cannot read expired cards
- ❌ Cannot insert, update, or delete cards

**Use Case**: Card viewing page (`/c/{occasion}/{slug}`) needs to display published cards

## Security Model

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Next.js API    │────▶│  Supabase    │
│  (Service Role) │     │  Database    │
└─────────────────┘     └──────────────┘
         │                      │
         │                      │ RLS Policies
         │                      ▼
         │              ┌──────────────┐
         │              │  Tables      │
         │              │  (Protected) │
         │              └──────────────┘
         │
         ▼
┌─────────────────┐
│  Card Data      │
│  (Public Read)  │
└─────────────────┘
```

## Important Notes

1. **API Bypasses RLS**: Your API uses the service role connection string, which has full access. This is correct - your API needs to create/update cards.

2. **No Authentication**: Since we're not using Supabase Auth, RLS policies use `public` role (anonymous access).

3. **Future-Proof**: If you add Supabase Auth later, you can add user-specific policies.

## Verifying Policies

You can verify policies in Supabase Dashboard:
1. Go to **Authentication** > **Policies**
2. Select `occasions` or `cards` table
3. You should see the policies listed

## Modifying Policies

To modify policies, edit `drizzle/rls-policies.sql` and run:
```bash
npm run setup-rls
```

Or use Supabase Dashboard → Authentication → Policies to manage them visually.

## Troubleshooting

### Error: "new row violates row-level security policy"
- This means RLS is blocking an operation
- Check that your API is using the service role connection string (not anon key)
- Verify the policy conditions match your use case

### Can't read cards/occasions
- Check that cards are `status = 'published'` and not expired
- Check that occasions have `is_active = true`
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('cards', 'occasions');`
