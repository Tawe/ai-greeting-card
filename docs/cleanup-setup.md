# Cleanup Job Setup

This document explains how to set up and run the cleanup job for expired cards.

## Overview

The cleanup job automatically deletes expired cards (older than 30 days by default) and their associated images from storage. This helps maintain database size and reduce storage costs.

## Components

1. **Cleanup Logic** (`lib/cleanup/index.ts`): Core cleanup functions
2. **API Endpoint** (`app/api/cleanup/route.ts`): HTTP endpoint for cron jobs
3. **Standalone Script** (`scripts/cleanup.ts`): Manual cleanup script

## Configuration

Add to your `.env.local`:

```bash
# Optional: Authentication token for cleanup endpoint
CLEANUP_AUTH_TOKEN=your-secret-token-here
```

## Running Cleanup

### Option 1: Manual Script (Development/Testing)

```bash
npm run cleanup
```

This runs the cleanup script directly and shows detailed output.

### Option 2: API Endpoint (Production)

The cleanup endpoint can be called via HTTP POST:

```bash
curl -X POST http://localhost:3000/api/cleanup \
  -H "Authorization: Bearer your-secret-token-here"
```

**Health Check:**
```bash
curl http://localhost:3000/api/cleanup
```

## Setting Up Cron Jobs

### Vercel Cron

Add to `vercel.json`:

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

Set the `CLEANUP_AUTH_TOKEN` environment variable in Vercel dashboard.

### GitHub Actions

Create `.github/workflows/cleanup.yml`:

```yaml
name: Cleanup Expired Cards

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run Cleanup
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cleanup \
            -H "Authorization: Bearer ${{ secrets.CLEANUP_AUTH_TOKEN }}"
```

### Other Platforms

Any cron service can call the `/api/cleanup` endpoint:
- **cron-job.org**: Free cron service
- **EasyCron**: Cron monitoring service
- **AWS EventBridge**: For AWS deployments
- **Cloudflare Workers**: Scheduled events

## What Gets Cleaned Up

1. **Expired Cards**: Cards where `expires_at < NOW()`
2. **Storage Images**: Associated cover images in S3/R2/MinIO
3. **Database Records**: Card records from the database

## Error Handling

The cleanup job:
- ✅ Continues processing even if individual cards fail
- ✅ Logs all errors for debugging
- ✅ Returns detailed results including error count
- ✅ Handles missing images gracefully (doesn't fail if image already deleted)

## Monitoring

The cleanup endpoint returns JSON with:
- `totalExpired`: Number of expired cards found
- `deleted`: Number successfully deleted
- `errors`: Array of errors encountered
- `durationMs`: Time taken in milliseconds

Example response:
```json
{
  "success": true,
  "result": {
    "totalExpired": 5,
    "deleted": 5,
    "errors": 0,
    "errorDetails": [],
    "durationMs": 1234
  }
}
```

## Security

⚠️ **Important**: Always set `CLEANUP_AUTH_TOKEN` in production to prevent unauthorized access to the cleanup endpoint.

The endpoint checks for `Authorization: Bearer {token}` header. If `CLEANUP_AUTH_TOKEN` is not set, the endpoint is unprotected (useful for development).

## Testing

To test cleanup without waiting for expiration:

1. Manually set `expires_at` in database:
```sql
UPDATE cards SET expires_at = NOW() - INTERVAL '1 day' WHERE id = 'your-card-id';
```

2. Run cleanup:
```bash
npm run cleanup
```

3. Verify card and image are deleted.
