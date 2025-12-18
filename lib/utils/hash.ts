import { createHash } from 'crypto';

/**
 * Generate a hash from device/user identifier for rate limiting
 * This should be called with a combination of IP, user agent, etc.
 */
export function generateCreatorHash(ip: string, userAgent: string): string {
  const combined = `${ip}:${userAgent}`;
  return createHash('sha256').update(combined).digest('hex').substring(0, 16);
}
