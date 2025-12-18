# Supabase Database Setup Guide

This guide explains how to set up Supabase (Postgres) for the AI Card Platform.

## Prerequisites

- A Supabase account (free tier available)
- Supabase project created

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Sign up or log in
3. Click **New Project**
4. Fill in:
   - **Name**: Your project name (e.g., `ai-card`)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **Create new project**

### 2. Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. **Important**: Change **Method** from "Direct connection" to **"Session mode"** (or "Connection pooling")
   - Direct connection is IPv6-only and may not work on IPv4 networks
   - Session mode works on both IPv4 and IPv6 networks
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

**Session mode** connection string looks like:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Direct connection** (IPv6-only, may not work):
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Set Environment Variable

Add to your `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual database password!

### 4. Run Migrations

```bash
npm run db:push
```

This will create the `occasions` and `cards` tables in your Supabase database.

### 5. Seed Initial Data

```bash
npm run db:seed
```

This adds the Christmas occasion to your database.

### 6. Set Up Row Level Security (RLS)

```bash
npm run setup-rls
```

This enables RLS and sets up security policies:
- ✅ Public read access to active occasions (for homepage)
- ✅ Public read access to published cards (for viewing)
- ✅ Blocks all direct writes (only API can write, using service role)

## Verifying Setup

You can verify your tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see:
   - `occasions` table
   - `cards` table

## Using Supabase Studio

Supabase provides a web-based SQL editor:

1. Go to **SQL Editor** in Supabase dashboard
2. You can run queries like:
   ```sql
   SELECT * FROM occasions;
   SELECT * FROM cards ORDER BY created_at DESC LIMIT 10;
   ```

## Connection Pooling (Required for IPv4 Networks)

**Important**: If you're on an IPv4 network (most home/office networks), you **must** use connection pooling/Session mode instead of direct connection. Direct connection is IPv6-only and will fail with DNS errors on IPv4 networks.

For production and IPv4 compatibility, use Supabase's connection pooling:

1. Go to **Settings** > **Database**
2. Use the **Connection pooling** connection string instead
3. Format: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

This helps with:
- Better connection management
- Reduced connection overhead
- Better performance under load

## Security Best Practices

1. **Never commit your connection string** - It's in `.gitignore`
2. **Use environment variables** - Store in `.env.local` locally, environment variables in production
3. **Use connection pooling** - For production deployments
4. **Set up Row Level Security (RLS)** - If you add authentication later
5. **Regular backups** - Supabase handles this automatically

## Troubleshooting

### Error: "connection refused" or "timeout"
- Check your connection string is correct
- Verify your database password
- Check if your IP needs to be whitelisted (Settings > Database > Connection pooling)

### Error: "relation does not exist"
- Run `npm run db:push` to create tables
- Check that migrations ran successfully

### Error: "password authentication failed"
- Verify your database password in the connection string
- Reset password in Supabase dashboard if needed

## Free Tier Limits

Supabase free tier includes:
- 500 MB database storage
- 2 GB bandwidth
- Unlimited API requests
- Perfect for MVP and development

## Next Steps

Once your database is set up:
1. ✅ Tables created (`npm run db:push`)
2. ✅ Data seeded (`npm run db:seed`)
3. ✅ Test card creation
4. ✅ Set up S3/R2 storage for images
5. ✅ Configure rate limiting
