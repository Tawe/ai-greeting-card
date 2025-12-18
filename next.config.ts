import type { NextConfig } from "next";

// Extract hostname from storage endpoint for image configuration
function getImageRemotePatterns() {
  const patterns: Array<{
    protocol: 'http' | 'https';
    hostname: string;
    port?: string;
    pathname: string;
  }> = [];

  const storageEndpoint = process.env.STORAGE_ENDPOINT || '';

  if (storageEndpoint) {
    try {
      const url = new URL(storageEndpoint);
      patterns.push({
        protocol: url.protocol === 'https:' ? 'https' : 'http',
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: '/**',
      });
    } catch (e) {
      // If it's not a valid URL, try to extract hostname manually
      const match = storageEndpoint.match(/https?:\/\/([^\/:]+)(?::(\d+))?/);
      if (match) {
        patterns.push({
          protocol: storageEndpoint.startsWith('https') ? 'https' : 'http',
          hostname: match[1],
          port: match[2] || undefined,
          pathname: '/**',
        });
      }
    }
  }

  // Add AWS S3 pattern if using S3
  if (process.env.STORAGE_BUCKET_NAME && process.env.STORAGE_REGION && !storageEndpoint) {
    patterns.push({
      protocol: 'https',
      hostname: `${process.env.STORAGE_BUCKET_NAME}.s3.${process.env.STORAGE_REGION}.amazonaws.com`,
      pathname: '/**',
    });
  }

  // Allow localhost for local development (MinIO)
  if (process.env.NODE_ENV === 'development') {
    patterns.push({
      protocol: 'http',
      hostname: 'localhost',
      port: '9000',
      pathname: '/**',
    });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getImageRemotePatterns(),
    // Disable optimization for localhost in development (avoids private IP blocking)
    unoptimized: process.env.NODE_ENV === 'development' && 
                 (process.env.STORAGE_ENDPOINT?.includes('localhost') || 
                  process.env.STORAGE_ENDPOINT?.includes('127.0.0.1')),
  },
};

export default nextConfig;
