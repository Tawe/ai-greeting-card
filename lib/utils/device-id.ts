/**
 * Generate and store a device identifier
 * Uses localStorage (persists across sessions) with cookie fallback
 */

const DEVICE_ID_KEY = 'ai-card-device-id';

export function getOrCreateDeviceId(): string {
  // Try localStorage first (persists across sessions)
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a new device ID
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    // Also set as cookie for server-side access
    setCookie(DEVICE_ID_KEY, deviceId, 365); // 1 year expiry
    
    return deviceId;
  }
  
  // Fallback for SSR
  return generateDeviceId();
}

function generateDeviceId(): string {
  // Generate a random device ID
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${randomPart}`;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getDeviceIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === DEVICE_ID_KEY) {
      return value;
    }
  }
  return null;
}
