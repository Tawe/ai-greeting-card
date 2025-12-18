# Deployment Guide

Complete guide for deploying the AI Holiday Card Platform to production.

## Overview

This guide covers deploying to production environments, including:
- Platform selection (Vercel, Railway, etc.)
- Production database setup
- Production storage configuration
- Environment variables
- Domain and SSL
- Monitoring and error tracking
- Cron jobs

## Prerequisites

Before deploying, ensure you have:
- ✅ Production database (Supabase)
- ✅ Production storage (R2/S3)
- ✅ Google AI Studio API key
- ✅ Domain name (optional but recommended)
- ✅ Environment variables configured

## Platform Options

### Vercel (Recommended)

Vercel is optimized for Next.js applications and provides:
- Automatic SSL
- Edge network
- Built-in cron jobs
- Environment variable management
- Preview deployments

#### Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Production Environment Variables**:
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all variables from `.env.local` (see [Environment Variables](./environment-variables.md))
   - Set environment to "Production"

5. **Configure Domain**:
   - Go to Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

6. **Set up Cron Job**:
   Create `vercel.json` in project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cleanup",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```
   - Set `CLEANUP_AUTH_TOKEN` in environment variables
   - Cron runs daily at 2 AM UTC

#### Vercel-Specific Configuration

**`vercel.json`** (optional):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

### Railway

Railway provides:
- Simple deployment
- PostgreSQL databases
- Environment variable management
- Custom domains

#### Deployment Steps

1. **Connect Repository**:
   - Go to [Railway](https://railway.app/)
   - Click "New Project"
   - Connect your GitHub repository

2. **Configure Build**:
   - Railway auto-detects Next.js
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Add Environment Variables**:
   - Go to Variables tab
   - Add all required variables

4. **Set up Database**:
   - Add PostgreSQL service
   - Copy connection string to `DATABASE_URL`
   - Run migrations: `npm run db:push`

5. **Deploy**:
   - Railway automatically deploys on push
   - Or click "Deploy" manually

---

### Other Platforms

#### Netlify

1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Configure cron via Netlify Functions

#### Render

1. Create Web Service
2. Connect repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Set up cron job via Render Cron Jobs

#### Self-Hosted (Docker)

**`Dockerfile`**:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**`docker-compose.yml`**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      # ... other variables
    restart: unless-stopped
```

---

## Production Database Setup

### Supabase Production

1. **Create Production Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Create new project
   - Choose region closest to your users

2. **Get Connection String**:
   - Settings > Database > Connection string
   - Use "Session mode" (connection pooling)
   - Copy to `DATABASE_URL`

3. **Run Migrations**:
   ```bash
   DATABASE_URL=your-production-url npm run db:push
   ```

4. **Seed Data**:
   ```bash
   DATABASE_URL=your-production-url npm run db:seed
   ```

5. **Set up RLS**:
   ```bash
   DATABASE_URL=your-production-url npm run setup-rls
   ```

6. **Backup Strategy**:
   - Enable automatic backups in Supabase
   - Set retention period (7-30 days recommended)

---

## Production Storage Setup

### Cloudflare R2 (Recommended)

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard > R2
   - Create bucket: `ai-card-images-prod`
   - Set public access if needed

2. **Create API Token**:
   - R2 > Manage R2 API Tokens
   - Create token with read/write permissions
   - Copy Access Key ID and Secret Access Key

3. **Configure CORS** (if needed):
   ```json
   [
     {
       "AllowedOrigins": ["https://yourdomain.com"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

4. **Set Environment Variables**:
   ```bash
   STORAGE_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   STORAGE_ACCESS_KEY_ID=your-access-key-id
   STORAGE_SECRET_ACCESS_KEY=your-secret-key
   STORAGE_BUCKET_NAME=ai-card-images-prod
   STORAGE_REGION=auto
   ```

### AWS S3

1. **Create S3 Bucket**:
   - AWS Console > S3
   - Create bucket: `ai-card-images-prod`
   - Choose region
   - Enable public access if needed

2. **Create IAM User**:
   - IAM > Users > Create user
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
   - Create access keys

3. **Configure CORS**:
   ```json
   [
     {
       "AllowedOrigins": ["https://yourdomain.com"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

4. **Set Environment Variables**:
   ```bash
   STORAGE_ENDPOINT=  # Leave empty for standard S3
   STORAGE_ACCESS_KEY_ID=your-access-key-id
   STORAGE_SECRET_ACCESS_KEY=your-secret-key
   STORAGE_BUCKET_NAME=ai-card-images-prod
   STORAGE_REGION=us-east-1
   ```

---

## Environment Variables

Set all production environment variables in your platform:

### Required

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db.abc123.supabase.co:5432/postgres

# AI Services
GEMINI_API_KEY=AIzaSyAbc123xyz...

# Storage
STORAGE_ENDPOINT=https://abc123xyz.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_BUCKET_NAME=ai-card-images-prod
STORAGE_REGION=us-east-1

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Recommended

```bash
# Rate Limiting
RATE_LIMIT_IP_MAX=10
RATE_LIMIT_DEVICE_MAX=3
RATE_LIMIT_WINDOW_HOURS=24

# Card Expiration
CARD_EXPIRATION_DAYS=30

# Cleanup Job
CLEANUP_AUTH_TOKEN=generate-strong-random-token-here
```

See [Environment Variables Documentation](./environment-variables.md) for details.

---

## Domain and SSL

### Custom Domain Setup

1. **Purchase Domain**:
   - Use any registrar (Namecheap, Google Domains, etc.)

2. **Configure DNS**:
   - Add CNAME record pointing to your platform
   - For Vercel: `cname.vercel-dns.com`
   - For Railway: Check Railway dashboard for DNS settings

3. **SSL Certificate**:
   - Vercel/Railway provide automatic SSL
   - Certificate auto-renews
   - Force HTTPS redirect (configure in platform settings)

### DNS Records Example

```
Type    Name    Value
CNAME   @       cname.vercel-dns.com
CNAME   www     cname.vercel-dns.com
```

---

## Monitoring and Error Tracking

### Vercel Analytics

1. **Enable Analytics**:
   - Vercel Dashboard > Analytics
   - Enable Web Analytics
   - View performance metrics

### Error Tracking

#### Sentry (Recommended)

1. **Install Sentry**:
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure** (`sentry.client.config.ts`):
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
     environment: process.env.NODE_ENV,
   });
   ```

3. **Add Environment Variable**:
   ```bash
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

#### LogRocket

1. Install LogRocket
2. Add to `app/layout.tsx`
3. Configure with API key

### Health Checks

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

Monitor: `https://yourdomain.com/api/health`

---

## Cron Jobs

### Vercel Cron

Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### External Cron Services

#### cron-job.org

1. Create account
2. Add new cron job
3. URL: `https://yourdomain.com/api/cleanup`
4. Headers: `Authorization: Bearer your-token`
5. Schedule: Daily at 2 AM UTC

#### EasyCron

1. Create account
2. Add HTTP job
3. Configure URL and headers
4. Set schedule

#### GitHub Actions

Create `.github/workflows/cleanup.yml`:
```yaml
name: Cleanup Expired Cards

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run Cleanup
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cleanup \
            -H "Authorization: Bearer ${{ secrets.CLEANUP_AUTH_TOKEN }}"
```

---

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Database seeded with occasions
- [ ] RLS policies configured
- [ ] Storage bucket created and configured
- [ ] Domain configured and SSL active
- [ ] Cron job configured
- [ ] Error tracking set up
- [ ] Health check endpoint working
- [ ] Test card creation
- [ ] Test card viewing
- [ ] Test social previews
- [ ] Monitor logs for errors

---

## Performance Optimization

### Image Optimization

- Images are already optimized via Next.js Image component
- Consider CDN for storage (Cloudflare R2 includes CDN)

### Database Optimization

- Indexes already created (slug, expires_at, creator_hash)
- Monitor query performance in Supabase dashboard
- Consider connection pooling (already using Session mode)

### Caching

- Next.js automatically caches static assets
- Consider adding Redis for API response caching (future)

---

## Security Checklist

- [ ] `CLEANUP_AUTH_TOKEN` set and strong
- [ ] Database password is strong
- [ ] Storage access keys are secure
- [ ] API keys are not exposed in client code
- [ ] RLS policies are active
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Content moderation is active
- [ ] Environment variables are not committed

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with database errors
- **Solution**: Ensure `DATABASE_URL` is set correctly
- **Solution**: Check database is accessible from build environment

**Issue**: Build fails with missing dependencies
- **Solution**: Run `npm install` locally first
- **Solution**: Check `package.json` is committed

### Runtime Errors

**Issue**: API returns 500 errors
- **Solution**: Check application logs
- **Solution**: Verify all environment variables are set
- **Solution**: Check database connection

**Issue**: Images not loading
- **Solution**: Verify storage credentials
- **Solution**: Check CORS configuration
- **Solution**: Verify `STORAGE_ENDPOINT` is correct

### Cron Job Issues

**Issue**: Cleanup job not running
- **Solution**: Verify cron configuration
- **Solution**: Check `CLEANUP_AUTH_TOKEN` is set
- **Solution**: Test endpoint manually: `curl -X POST https://yourdomain.com/api/cleanup -H "Authorization: Bearer your-token"`

---

## Rollback Plan

If deployment fails:

1. **Vercel**: Use "Redeploy" to previous version
2. **Railway**: Use "Rollback" in deployment history
3. **Database**: Restore from backup if needed
4. **Environment**: Revert environment variables if changed

---

## Related Documentation

- [Environment Variables](./environment-variables.md) - Variable reference
- [API Documentation](./api-documentation.md) - API reference
- [Supabase Setup](./supabase-setup.md) - Database setup
- [Storage Setup](./storage-setup.md) - Storage configuration
- [Cleanup Setup](./cleanup-setup.md) - Cron job setup

---

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test endpoints individually
5. Check database and storage connectivity
