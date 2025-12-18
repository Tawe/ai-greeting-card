import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';

const s3Client = new S3Client({
  endpoint: config.storage.endpoint || undefined,
  region: config.storage.region,
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
  forcePathStyle: true, // Required for S3-compatible services like R2
});

/**
 * Upload an image buffer to S3-compatible storage
 */
export async function uploadImage(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
    ACL: 'public-read', // Make objects publicly readable
  });

  await s3Client.send(command);

  // Return public URL
  if (config.storage.endpoint) {
    // S3-compatible (R2, etc.)
    return `${config.storage.endpoint}/${config.storage.bucketName}/${key}`;
  } else {
    // Standard S3
    return `https://${config.storage.bucketName}.s3.${config.storage.region}.amazonaws.com/${key}`;
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
