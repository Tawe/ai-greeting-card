import { config } from '../config';
import { generateCreatorHash } from '../utils/hash';

// In-memory rate limit store (for MVP)
// In production, use Redis or Cloudflare KV
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const key = identifier;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    // No entry or window expired, create new entry
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    
    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
      cleanupExpiredEntries();
    }
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
    };
  }
  
  // Entry exists and window is still valid
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check IP-based rate limit
 */
export async function checkIPRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const windowMs = config.rateLimit.windowHours * 60 * 60 * 1000;
  return checkRateLimit(`ip:${ip}`, config.rateLimit.ipMax, windowMs);
}

/**
 * Check device-based rate limit
 */
export async function checkDeviceRateLimit(deviceHash: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const windowMs = config.rateLimit.windowHours * 60 * 60 * 1000;
  return checkRateLimit(`device:${deviceHash}`, config.rateLimit.deviceMax, windowMs);
}

/**
 * Get device identifier from request
 * Uses IP + User-Agent hash (same as creator hash)
 */
export function getDeviceIdentifier(ip: string, userAgent: string): string {
  return generateCreatorHash(ip, userAgent);
}

// Re-export middleware
export { rateLimitMiddleware } from './middleware';
