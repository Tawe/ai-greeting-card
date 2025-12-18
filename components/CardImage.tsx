'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CardImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * CardImage component that handles both localhost and production image URLs
 * Uses regular img tag for localhost (to avoid Next.js Image private IP blocking)
 * Uses Next.js Image for production URLs (for optimization)
 */
export default function CardImage({ src, alt, fill, className, priority }: CardImageProps) {
  const [error, setError] = useState(false);
  
  // Check if URL is localhost (development)
  const isLocalhost = src.includes('localhost') || src.includes('127.0.0.1');
  
  // If localhost or error, use regular img tag
  if (isLocalhost || error) {
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={() => setError(true)}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
  }
  
  // Use Next.js Image for production URLs
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={800}
      height={600}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
