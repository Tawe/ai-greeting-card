// App configuration
export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  rateLimit: {
    ipMax: parseInt(process.env.RATE_LIMIT_IP_MAX || '10', 10),
    deviceMax: parseInt(process.env.RATE_LIMIT_DEVICE_MAX || '3', 10),
    windowHours: parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || '24', 10),
  },
  card: {
    expirationDays: parseInt(process.env.CARD_EXPIRATION_DAYS || '30', 10),
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || '',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
    bucketName: process.env.STORAGE_BUCKET_NAME || '',
    region: process.env.STORAGE_REGION || 'us-east-1',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
} as const;
