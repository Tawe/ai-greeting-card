# MinIO Public Access Setup

If you're getting 403 Forbidden errors when accessing images from MinIO, you need to configure the bucket for public read access.

## Quick Fix: Set Bucket Policy

### Option 1: Using MinIO Client (mc) - Recommended

The MinIO Console doesn't always show a Policy tab. Use the MinIO client instead:

1. **Install MinIO Client**:
   ```bash
   # macOS
   brew install minio/stable/mc
   
   # Linux
   wget https://dl.min.io/client/mc/release/linux-amd64/mc
   chmod +x mc
   sudo mv mc /usr/local/bin/
   
   # Windows
   # Download from https://dl.min.io/client/mc/release/windows-amd64/mc.exe
   ```

2. **Configure MinIO alias**:
   ```bash
   mc alias set local http://localhost:9000 minioadmin minioadmin
   ```
   Replace `minioadmin` with your actual MinIO credentials if different.

3. **Set bucket to public read**:
   ```bash
   mc anonymous set download local/ai-card-images
   ```
   This sets the bucket policy to allow public read access.

4. **Verify it worked**:
   ```bash
   mc anonymous get local/ai-card-images
   ```
   Should show `download` policy.

### Option 2: Using MinIO Console (if Policy tab exists)

Some MinIO versions have the Policy tab in different locations:

1. **Open MinIO Console**: Go to `http://localhost:9001`
2. **Login** with your MinIO credentials
3. **Navigate to Buckets**: Click on "Buckets" in the sidebar
4. **Select your bucket**: Click on `ai-card-images`
5. **Look for**: 
   - "Access Policy" tab (if available)
   - "Summary" tab → "Access Policy" section
   - Or right-click bucket → "Set Access Policy"
6. **Set to Public** or add custom policy

### Option 3: Set Custom Policy via mc (if needed)

If you need a custom policy instead of the default `download` policy:

1. **Create policy file** (`policy.json`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": ["s3:GetObject"],
         "Resource": ["arn:aws:s3:::ai-card-images/*"]
       }
     ]
   }
   ```

2. **Apply policy**:
   ```bash
   mc anonymous set-json policy.json local/ai-card-images
   ```

### Option 3: Using MinIO API

```bash
# Set bucket policy via API
curl -X PUT http://localhost:9000/ai-card-images?policy \
  -H "Authorization: AWS YOUR_ACCESS_KEY:YOUR_SIGNATURE" \
  -d @policy.json
```

## Configure CORS

You also need to configure CORS to allow images to be loaded from your Next.js app:

### Using MinIO Console:

1. Go to your bucket
2. Click "Access Rules" tab
3. Add CORS rule:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Using MinIO Client:

```bash
# Create CORS config file
cat > cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS
mc anonymous set-json cors.json local/ai-card-images
```

## Verify Configuration

After setting up:

1. **Test bucket policy**:
   ```bash
   curl http://localhost:9000/ai-card-images/cards/test/cover-1.png
   ```
   Should return image data, not 403.

2. **Test CORS**:
   ```bash
   curl -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:9000/ai-card-images/cards/test/cover-1.png
   ```
   Should include CORS headers in response.

## Troubleshooting

### Still getting 403?

1. **Check bucket name**: Ensure it matches exactly (case-sensitive)
2. **Check policy syntax**: JSON must be valid
3. **Restart MinIO**: Sometimes requires restart to apply changes
4. **Check MinIO logs**: Look for permission errors

### Images load but CORS errors?

1. **Verify CORS origins**: Must include your Next.js URL exactly
2. **Check browser console**: Look for CORS error messages
3. **Test with curl**: Verify CORS headers are present

## Production Note

For production, be more restrictive:
- Only allow specific origins (your domain)
- Consider using signed URLs instead of public access
- Set up proper authentication
