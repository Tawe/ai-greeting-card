# S3-Compatible Storage Setup Guide

This guide covers setting up S3-compatible storage for storing generated card images. You can use either **AWS S3** or **Cloudflare R2** (recommended for free tier).

## Option 1: Cloudflare R2 (Recommended - Free Tier)

Cloudflare R2 is S3-compatible and offers a generous free tier (10GB storage, 1M operations/month).

### Steps:

1. **Create a Cloudflare Account**
   - Go to [Cloudflare](https://dash.cloudflare.com/sign-up)
   - Sign up or log in

2. **Enable R2**
   - In the Cloudflare dashboard, go to **R2** in the left sidebar
   - Click **Create bucket**
   - Choose a bucket name (e.g., `ai-card-images`)
   - Select a location (choose closest to your users)
   - Click **Create bucket**

3. **Create API Token**
   - Go to **Manage R2 API Tokens** (or **R2** > **Manage R2 API Tokens**)
   - Click **Create API token**
   - Give it a name (e.g., `ai-card-storage`)
   - Set permissions: **Object Read & Write**
   - Select your bucket
   - Click **Create API Token**
   - **Save these values immediately** (you won't see them again):
     - Access Key ID
     - Secret Access Key

4. **Get Your R2 Endpoint**
   - In your bucket settings, find the **S3 API** section
   - Your endpoint will be something like: `https://<account-id>.r2.cloudflarestorage.com`
   - Or use the public URL if you've set up a custom domain

5. **Add to `.env.local`**
   ```bash
   STORAGE_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
   STORAGE_ACCESS_KEY_ID=your-access-key-id
   STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
   STORAGE_BUCKET_NAME=ai-card-images
   STORAGE_REGION=auto
   ```

## Option 2: AWS S3

### Steps:

1. **Create AWS Account**
   - Go to [AWS Console](https://aws.amazon.com/)
   - Sign up or log in

2. **Create S3 Bucket**
   - Go to **S3** in AWS Console
   - Click **Create bucket**
   - Choose a bucket name (must be globally unique)
   - Select a region (e.g., `us-east-1`)
   - Uncheck **Block all public access** (or configure public access as needed)
   - Click **Create bucket**

3. **Create IAM User for API Access**
   - Go to **IAM** > **Users**
   - Click **Create user**
   - Username: `ai-card-storage`
   - Select **Provide user access to the AWS Management Console** (optional) or just API access
   - Click **Next**

4. **Set Permissions**
   - Select **Attach policies directly**
   - Search for and select: **AmazonS3FullAccess** (or create a custom policy with only needed permissions)
   - Click **Next** > **Create user**

5. **Create Access Keys**
   - Click on the user you just created
   - Go to **Security credentials** tab
   - Click **Create access key**
   - Select **Application running outside AWS**
   - Click **Next** > **Create access key**
   - **Save these values immediately**:
     - Access key ID
     - Secret access key

6. **Configure Bucket CORS (for web access)**
   - Go to your S3 bucket
   - Click **Permissions** tab
   - Scroll to **Cross-origin resource sharing (CORS)**
   - Click **Edit** and add:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

7. **Add to `.env.local`**
   ```bash
   STORAGE_ENDPOINT=
   STORAGE_ACCESS_KEY_ID=your-access-key-id
   STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
   STORAGE_BUCKET_NAME=your-bucket-name
   STORAGE_REGION=us-east-1
   ```
   Note: Leave `STORAGE_ENDPOINT` empty for AWS S3 (it uses default endpoints)

## Option 3: Local Development (MinIO or LocalStack)

For local development/testing without cloud services:

### Using MinIO:

1. **Install MinIO**
   ```bash
   brew install minio/stable/minio  # macOS
   # or download from https://min.io/download
   ```

2. **Start MinIO**
   ```bash
   minio server ~/minio-data
   ```
   This will give you:
   - Access Key: `minioadmin`
   - Secret Key: `minioadmin`
   - Endpoint: `http://localhost:9000`

3. **Create Bucket**
   - Go to `http://localhost:9000`
   - Login with the credentials above
   - Create a bucket named `ai-card-images`

4. **Add to `.env.local`**
   ```bash
   STORAGE_ENDPOINT=http://localhost:9000
   STORAGE_ACCESS_KEY_ID=minioadmin
   STORAGE_SECRET_ACCESS_KEY=minioadmin
   STORAGE_BUCKET_NAME=ai-card-images
   STORAGE_REGION=us-east-1
   ```

## Testing Your Setup

Once configured, test the storage connection:

```bash
npm run dev
```

Then try creating a card. If storage is working, you should see:
- Images uploaded successfully
- Image URLs stored in the database
- Images accessible via the URLs

## Troubleshooting

### Error: "Access Denied" or "403 Forbidden"
- Check your access key ID and secret access key
- Verify bucket name is correct
- For AWS S3, check IAM permissions
- For R2, verify API token permissions

### Error: "Bucket not found"
- Verify bucket name matches exactly
- Check region is correct
- Ensure bucket exists in your account

### Error: "Endpoint not reachable"
- For R2: Verify endpoint URL format
- For AWS: Leave `STORAGE_ENDPOINT` empty
- Check network connectivity
- Verify endpoint URL doesn't have trailing slashes

### Images not loading publicly
- For R2: Set up a custom domain or use public URLs
- For AWS S3: Configure bucket policy for public read access
- Check CORS configuration

## Security Best Practices

1. **Never commit credentials** - `.env.local` is in `.gitignore`
2. **Use least privilege** - Only grant necessary permissions
3. **Rotate keys regularly** - Update access keys periodically
4. **Use environment-specific buckets** - Separate dev/prod buckets
5. **Enable versioning** - For production, enable bucket versioning
6. **Set up lifecycle policies** - Auto-delete old images after 30 days

## Cost Considerations

- **Cloudflare R2**: Free tier (10GB storage, 1M operations/month), then $0.015/GB storage
- **AWS S3**: ~$0.023/GB storage + $0.0004 per 1,000 requests
- **MinIO**: Free for local development

For this project, Cloudflare R2 is recommended due to the generous free tier.
