import { S3Client, PutObjectCommand, DeleteObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { config } from '../config';

// Only use forcePathStyle for S3-compatible services (R2, MinIO, etc.)
// Standard AWS S3 uses virtual-hosted-style URLs by default
const s3Client = new S3Client({
  endpoint: config.storage.endpoint || undefined,
  region: config.storage.region,
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
  forcePathStyle: !!config.storage.endpoint, // Only for S3-compatible services
});

/**
 * Upload an image buffer to S3-compatible storage
 */
export async function uploadImage(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  // Validate configuration
  if (!config.storage.bucketName) {
    throw new Error('STORAGE_BUCKET_NAME is not configured');
  }
  if (!config.storage.accessKeyId || !config.storage.secretAccessKey) {
    throw new Error('Storage credentials are not configured (STORAGE_ACCESS_KEY_ID or STORAGE_SECRET_ACCESS_KEY missing)');
  }

  console.log(`📦 Uploading to bucket: ${config.storage.bucketName}, key: ${key}, size: ${buffer.length} bytes`);

  const command = new PutObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
    ACL: 'public-read', // Make objects publicly readable
  });

  try {
    await s3Client.send(command);
    console.log(`✅ Upload successful to ${config.storage.bucketName}/${key}`);
  } catch (error: any) {
    console.error('❌ S3 upload failed:', {
      name: error.name,
      message: error.message,
      code: error.Code || error.code,
      bucket: config.storage.bucketName,
      key: key,
      endpoint: config.storage.endpoint || 'default S3',
      region: config.storage.region,
    });
    throw error;
  }

  // Return public URL
  if (config.storage.endpoint) {
    // S3-compatible (R2, etc.)
    const url = `${config.storage.endpoint}/${config.storage.bucketName}/${key}`;
    console.log(`🔗 Generated URL (with endpoint): ${url}`);
    return url;
  } else {
    // Standard S3
    const url = `https://${config.storage.bucketName}.s3.${config.storage.region}.amazonaws.com/${key}`;
    console.log(`🔗 Generated URL (standard S3): ${url}`);
    return url;
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a storage key for a card image
 */
export function generateImageKey(cardId: string, version: string = '1'): string {
  return `cards/${cardId}/cover-${version}.png`;
}

/**
 * Set bucket policy to allow public read access
 * This is required for AWS S3 buckets to serve images publicly
 * Note: Requires s3:PutBucketPolicy permission
 */
export async function setupBucketPolicy(): Promise<void> {
  // Skip if using S3-compatible service with endpoint (like R2)
  if (config.storage.endpoint) {
    console.log('⚠️  Skipping bucket policy setup for S3-compatible service. Configure public access manually.');
    return;
  }

  const bucketPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${config.storage.bucketName}/*`,
      },
    ],
  };

  try {
    const command = new PutBucketPolicyCommand({
      Bucket: config.storage.bucketName,
      Policy: JSON.stringify(bucketPolicy),
    });

    await s3Client.send(command);
    console.log('✅ Bucket policy set successfully');
  } catch (error: any) {
    if (error.name === 'AccessDenied') {
      console.error('❌ Permission denied: s3:PutBucketPolicy permission required');
      console.error('   Please set the bucket policy manually in AWS Console:');
      console.error(`   Bucket: ${config.storage.bucketName}`);
      console.error('   Policy:', JSON.stringify(bucketPolicy, null, 2));
    } else {
      throw error;
    }
  }
}
