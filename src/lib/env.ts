import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  NEXT_PUBLIC_BFF_URL: z.string().url().default('http://localhost:3000'),

  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('Lastro App'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // NextAuth Configuration
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).default(''),

  // Vercel Deployment (auto-populated by Vercel)
  VERCEL_URL: z.string().optional(),

  // Keycloak Server-side (NextAuth)
  KEYCLOAK_ID: z.string().default(''),
  KEYCLOAK_SECRET: z.string().default(''),
  KEYCLOAK_ISSUER: z.string().default(''),

  // Keycloak Client-side
  NEXT_PUBLIC_KEYCLOAK_URL: z.string().default(''),
  NEXT_PUBLIC_KEYCLOAK_REALM: z.string().default(''),
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: z.string().default(''),

  // Socket.IO Configuration (optional)
  NEXT_PUBLIC_SOCKET_URL: z
    .string()
    .url()
    .default('ws://localhost:3001')
    .optional(),

  // Chat WebSocket Configuration
  NEXT_PUBLIC_CHAT_SOCKET_URL: z
    .string()
    .url()
    .refine(
      (u) => u.startsWith('wss://'),
      'NEXT_PUBLIC_CHAT_SOCKET_URL must use wss://'
    )
    .optional(),

  // Agency Configuration
  NEXT_PUBLIC_AGENCY_ID: z.string().optional(),

  // Datadog RUM
  NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_DATADOG_APPLICATION_ID: z.string().optional(),
  NEXT_PUBLIC_DATADOG_ENV: z.string().optional(),
  NEXT_PUBLIC_DATADOG_VERSION: z.string().optional(),
  NEXT_PUBLIC_DATADOG_SITE: z
    .enum([
      'datadoghq.com',
      'datadoghq.eu',
      'us3.datadoghq.com',
      'us5.datadoghq.com',
      'ap1.datadoghq.com',
      'ddog-gov.com',
    ])
    .default('datadoghq.com'),
  NEXT_PUBLIC_DATADOG_SERVICE: z.string().optional(),

  // Amplitude Analytics (Server-side only)
  AMPLITUDE_API_KEY: z.string().optional(),

  // Analytics PII Control (Server-side only)
  ANALYTICS_CAPTURE_PII: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),

  // Mock Service Worker (MSW) - Enable API mocking
  NEXT_PUBLIC_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
});

// IMPORTANT: Next.js only inlines NEXT_PUBLIC_* vars when they are
// explicitly referenced as `process.env.NEXT_PUBLIC_*` in source code.
// Passing `process.env` as a whole object does NOT work on the client
// because Next.js does string replacement at build time, not runtime.
// We must explicitly list each NEXT_PUBLIC_ var here.
export const env = envSchema.parse({
  ...process.env,
  NEXT_PUBLIC_BFF_URL: process.env.NEXT_PUBLIC_BFF_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_CHAT_SOCKET_URL: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL,
  NEXT_PUBLIC_AGENCY_ID: process.env.NEXT_PUBLIC_AGENCY_ID,
  NEXT_PUBLIC_DATADOG_CLIENT_TOKEN:
    process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
  NEXT_PUBLIC_DATADOG_APPLICATION_ID:
    process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
  NEXT_PUBLIC_DATADOG_ENV: process.env.NEXT_PUBLIC_DATADOG_ENV,
  NEXT_PUBLIC_DATADOG_VERSION: process.env.NEXT_PUBLIC_DATADOG_VERSION,
  NEXT_PUBLIC_DATADOG_SITE: process.env.NEXT_PUBLIC_DATADOG_SITE,
  NEXT_PUBLIC_DATADOG_SERVICE: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
  NEXT_PUBLIC_ENABLE_MOCKS: process.env.NEXT_PUBLIC_ENABLE_MOCKS,
});

/**
 * Helper to determine if the current environment is development
 */
export const isDevelopment = (): boolean => {
  return env.NODE_ENV === 'development';
};

/**
 * Helper to determine if the current environment is production
 */
export const isProduction = (): boolean => {
  return env.NODE_ENV === 'production';
};

/**
 * Get the NextAuth URL with automatic fallback to Vercel URL
 * This is useful for preview deployments where NEXTAUTH_URL is not set
 * but VERCEL_URL is automatically populated by Vercel
 */
export const getNextAuthUrl = (): string => {
  // Priority 1: Use NEXTAUTH_URL if explicitly set
  if (env.NEXTAUTH_URL) {
    return env.NEXTAUTH_URL;
  }

  // Priority 2: Use VERCEL_URL for preview deployments (add https:// protocol)
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  // Priority 3: Fallback to BFF URL (typically localhost in development)
  return env.NEXT_PUBLIC_BFF_URL;
};
