import { NextRequest, NextResponse } from 'next/server';
import { checkIPRateLimit, checkDeviceRateLimit, getDeviceIdentifier } from './index';

/**
 * Rate limit middleware for API routes
 * Checks both IP and device-based limits
 */
export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Get IP address
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Get device identifier
  const deviceHash = getDeviceIdentifier(ip, userAgent);

  // Check IP-based rate limit
  const ipLimit = await checkIPRateLimit(ip);
  if (!ipLimit.allowed) {
    const resetDate = new Date(ipLimit.resetAt);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests from this IP. Limit: ${ipLimit.remaining} remaining. Try again after ${resetDate.toISOString()}`,
        limit: 'ip',
        resetAt: resetDate.toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.getTime().toString(),
          'Retry-After': Math.ceil((ipLimit.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Check device-based rate limit
  const deviceLimit = await checkDeviceRateLimit(deviceHash);
  if (!deviceLimit.allowed) {
    const resetDate = new Date(deviceLimit.resetAt);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests from this device. Limit: ${deviceLimit.remaining} remaining. Try again after ${resetDate.toISOString()}`,
        limit: 'device',
        resetAt: resetDate.toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.getTime().toString(),
          'Retry-After': Math.ceil((deviceLimit.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Both limits passed, add rate limit headers to response
  // (We'll add these in the actual route handler)
  return null; // null means continue with request
}
