# Environment Variables

Complete reference for all environment variables used in the AI Holiday Card Platform.

## Quick Start

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

## Required Variables

### Database

#### `DATABASE_URL`

**Type:** `string`  
**Required:** Yes  
**Description:** PostgreSQL connection string for Supabase (or other Postgres database)

**Format:**
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

**Example:**
```bash
DATABASE_URL=postgresql://postgres:mypassword@db.abc123.supabase.co:5432/postgres
```

**Notes:**
- Get connection string from Supabase Dashboard > Settings > Database
- Use "Session mode" (connection pooling) for IPv4 compatibility
- URL-encode special characters in password (`/`, `%`, etc.)
- See [Supabase Setup Guide](./supabase-setup.md) for details

---

### AI Services

#### `GEMINI_API_KEY`

**Type:** `string`  
**Required:** Yes  
**Description:** Google AI Studio API key (used for both text and image generation)

**How to get:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one
5. Copy the key to your `.env.local`

**Example:**
```bash
GEMINI_API_KEY=AIzaSyAbc123xyz...
```

**Notes:**
- Same API key works for both Gemini (text) and Imagen (images)
- Free tier has rate limits
- See [Imagen API Setup Guide](./imagen-setup.md) for details

---

### Storage

#### `STORAGE_ENDPOINT`

**Type:** `string`  
**Required:** Yes (for S3-compatible services like R2/MinIO)  
**Description:** Endpoint URL for S3-compatible storage

**Examples:**
```bash
# Cloudflare R2
STORAGE_ENDPOINT=https://abc123xyz.r2.cloudflarestorage.com

# MinIO (local development)
STORAGE_ENDPOINT=http://localhost:9000

# AWS S3 (leave empty, uses standard S3 URL format)
STORAGE_ENDPOINT=
```

**Notes:**
- Required for R2, MinIO, and other S3-compatible services
- Leave empty for standard AWS S3 (uses bucket.s3.region.amazonaws.com format)
- See [Storage Setup Guide](./storage-setup.md) for details

#### `STORAGE_ACCESS_KEY_ID`

**Type:** `string`  
**Required:** Yes  
**Description:** Access key ID for S3-compatible storage

**Example:**
```bash
STORAGE_ACCESS_KEY_ID=your-access-key-id
```

#### `STORAGE_SECRET_ACCESS_KEY`

**Type:** `string`  
**Required:** Yes  
**Description:** Secret access key for S3-compatible storage

**Example:**
```bash
STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
```

**Security Note:** Never commit this to version control!

#### `STORAGE_BUCKET_NAME`

**Type:** `string`  
**Required:** Yes  
**Description:** Name of the S3 bucket (or R2 bucket)

**Example:**
```bash
STORAGE_BUCKET_NAME=ai-card-images
```

#### `STORAGE_REGION`

**Type:** `string`  
**Required:** Yes  
**Default:** `us-east-1`  
**Description:** AWS region (or region identifier for S3-compatible services)

**Example:**
```bash
STORAGE_REGION=us-east-1
```

**Notes:**
- Used for standard AWS S3 URL generation
- For R2, can be any value (e.g., `auto`)
- For MinIO, typically `us-east-1`

---

## Optional Variables

### App Configuration

#### `NEXT_PUBLIC_APP_URL`

**Type:** `string`  
**Required:** No  
**Default:** `http://localhost:3000`  
**Description:** Public URL of your application (used for deep links)

**Examples:**
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Notes:**
- Must be accessible from the internet in production
- Used to generate shareable deep links
- Must include protocol (`http://` or `https://`)

---

### Rate Limiting

#### `RATE_LIMIT_IP_MAX`

**Type:** `number`  
**Required:** No  
**Default:** `10`  
**Description:** Maximum number of cards per IP address per time window

**Example:**
```bash
RATE_LIMIT_IP_MAX=10
```

#### `RATE_LIMIT_DEVICE_MAX`

**Type:** `number`  
**Required:** No  
**Default:** `3`  
**Description:** Maximum number of cards per device per time window

**Example:**
```bash
RATE_LIMIT_DEVICE_MAX=3
```

#### `RATE_LIMIT_WINDOW_HOURS`

**Type:** `number`  
**Required:** No  
**Default:** `24`  
**Description:** Time window in hours for rate limiting

**Example:**
```bash
RATE_LIMIT_WINDOW_HOURS=24
```

**Notes:**
- Current implementation uses in-memory storage (resets on server restart)
- For production, consider using Redis/KV (see below)

---

### Card Expiration

#### `CARD_EXPIRATION_DAYS`

**Type:** `number`  
**Required:** No  
**Default:** `30`  
**Description:** Number of days before cards expire

**Example:**
```bash
CARD_EXPIRATION_DAYS=30
```

**Notes:**
- Cards are automatically deleted after expiration
- Set to `0` to disable expiration (not recommended)

---

### Cleanup Job

#### `CLEANUP_AUTH_TOKEN`

**Type:** `string`  
**Required:** No  
**Description:** Authentication token for cleanup endpoint (recommended for production)

**Example:**
```bash
CLEANUP_AUTH_TOKEN=your-secret-token-here
```

**Notes:**
- If set, cleanup endpoint requires `Authorization: Bearer {token}` header
- If not set, endpoint is unprotected (useful for development)
- Generate a strong random token for production
- See [Cleanup Setup Guide](./cleanup-setup.md) for details

---

### AI Model Overrides

#### `GEMINI_MODEL_NAME`

**Type:** `string`  
**Required:** No  
**Default:** `gemini-2.5-flash`  
**Description:** Override default Gemini model for text generation

**Example:**
```bash
GEMINI_MODEL_NAME=gemini-2.5-flash
```

**Notes:**
- Must be a valid Gemini model name
- See [Google AI Studio](https://ai.google.dev/) for available models

#### `IMAGEN_MODEL_NAME`

**Type:** `string`  
**Required:** No  
**Default:** `gemini-2.5-flash-image`  
**Description:** Override default Imagen model for image generation

**Example:**
```bash
IMAGEN_MODEL_NAME=gemini-2.5-flash-image
```

**Notes:**
- Must be a valid Imagen/Gemini image model name
- See [Imagen API Setup Guide](./imagen-setup.md) for details

---

### Future: Rate Limiting Storage

These are placeholders for future Redis/KV integration:

#### `REDIS_URL`

**Type:** `string`  
**Required:** No  
**Description:** Redis connection URL for persistent rate limiting

**Example:**
```bash
REDIS_URL=redis://localhost:6379
```

**Notes:**
- Not currently implemented
- Will replace in-memory rate limiting in production

#### `KV_NAMESPACE`

**Type:** `string`  
**Required:** No  
**Description:** Cloudflare KV namespace for rate limiting

**Example:**
```bash
KV_NAMESPACE=your-kv-namespace-id
```

**Notes:**
- Not currently implemented
- For Cloudflare Workers deployments

---

## Environment File Structure

Your `.env.local` file should look like:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db.abc123.supabase.co:5432/postgres

# AI Services
GEMINI_API_KEY=AIzaSyAbc123xyz...

# Storage
STORAGE_ENDPOINT=https://abc123xyz.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
STORAGE_BUCKET_NAME=ai-card-images
STORAGE_REGION=us-east-1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting (optional)
RATE_LIMIT_IP_MAX=10
RATE_LIMIT_DEVICE_MAX=3
RATE_LIMIT_WINDOW_HOURS=24

# Card Expiration (optional)
CARD_EXPIRATION_DAYS=30

# Cleanup Job (optional)
CLEANUP_AUTH_TOKEN=your-secret-token

# AI Model Overrides (optional)
# GEMINI_MODEL_NAME=gemini-2.5-flash
# IMAGEN_MODEL_NAME=gemini-2.5-flash-image
```

---

## Security Best Practices

1. **Never commit `.env.local`**: Already in `.gitignore`
2. **Use strong tokens**: Generate random tokens for `CLEANUP_AUTH_TOKEN`
3. **Rotate keys**: Regularly rotate API keys and access keys
4. **Limit access**: Use least-privilege IAM policies for storage
5. **Environment separation**: Use different keys for dev/staging/production
6. **URL encoding**: Properly encode special characters in `DATABASE_URL`

---

## Validation

The application validates required environment variables on startup:

- Missing `DATABASE_URL`: Application won't start
- Missing `GEMINI_API_KEY`: AI features won't work
- Missing storage config: Image uploads will fail

Check application logs for validation errors.

---

## Troubleshooting

### Database Connection Issues

**Error:** `Invalid URL` or connection timeout
- **Solution:** Check `DATABASE_URL` format
- **Solution:** URL-encode special characters in password
- **Solution:** Use "Session mode" connection string from Supabase

### Storage Issues

**Error:** `Access Denied` or `Invalid credentials`
- **Solution:** Verify `STORAGE_ACCESS_KEY_ID` and `STORAGE_SECRET_ACCESS_KEY`
- **Solution:** Check bucket permissions
- **Solution:** Verify `STORAGE_BUCKET_NAME` is correct

### AI API Issues

**Error:** `API key not found` or `403 Forbidden`
- **Solution:** Verify `GEMINI_API_KEY` is correct
- **Solution:** Check API key has proper permissions
- **Solution:** Ensure API key is not expired

### Rate Limiting Not Working

**Issue:** Rate limits reset on server restart
- **Solution:** This is expected with in-memory storage
- **Solution:** Implement Redis/KV for persistent rate limiting (future)

---

## Related Documentation

- [Supabase Setup](./supabase-setup.md) - Database configuration
- [Storage Setup](./storage-setup.md) - S3/R2 configuration
- [Imagen API Setup](./imagen-setup.md) - AI API configuration
- [Cleanup Setup](./cleanup-setup.md) - Cleanup job configuration
- [API Documentation](./api-documentation.md) - API reference
