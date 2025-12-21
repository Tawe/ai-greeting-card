# Quick Fix: S3 Images Getting 403 Forbidden

If your S3 images are returning 403 Forbidden errors, follow these steps:

## Step 1: Disable "Block all public access"

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click on your bucket (`ai-card-storage`)
3. Go to the **Permissions** tab
4. Scroll to **Block public access (bucket settings)**
5. Click **Edit**
6. **Uncheck all 4 boxes** (or at least uncheck "Block public access to buckets and objects granted through new access control lists (ACLs)")
7. Click **Save changes**
8. Type `confirm` when prompted

## Step 2: Add Bucket Policy

1. Still in the **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste this policy (replace `ai-card-storage` with your bucket name if different):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ai-card-storage/*"
    }
  ]
}
```

5. Click **Save changes**

## Step 3: Verify Object Ownership Settings

1. Still in **Permissions** tab
2. Scroll to **Object Ownership**
3. Make sure it's set to **Bucket owner preferred** (not "Bucket owner enforced")
   - If it's "Bucket owner enforced", ACLs are ignored
   - Click **Edit** and change to **Bucket owner preferred** if needed

## Step 4: Test

Try accessing an image URL directly:
```
https://ai-card-storage.s3.us-east-1.amazonaws.com/cards/[card-id]/cover-[version].png
```

It should load the image, not return 403.

## Alternative: Use the Setup Script

You can also try running the setup script (requires s3:PutBucketPolicy permission):

```bash
npm run setup-s3-bucket
```

This will attempt to set the bucket policy automatically. If it fails due to permissions, follow the manual steps above.

## Still Not Working?

1. **Check IAM permissions**: Your IAM user needs `s3:PutObject` and `s3:PutObjectAcl` permissions
2. **Verify bucket name**: Make sure it matches exactly in your `.env.local`
3. **Check region**: Ensure `STORAGE_REGION` matches your bucket's region
4. **Wait a few minutes**: S3 changes can take a moment to propagate

## Security Note

Making your bucket publicly readable means anyone with the URL can access the images. This is typically fine for a card sharing platform, but:
- Consider using CloudFront or Cloudflare for additional security
- Set up lifecycle policies to auto-delete old images
- Monitor access logs if needed
