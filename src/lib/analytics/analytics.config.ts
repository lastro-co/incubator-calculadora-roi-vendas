import { env } from '@/lib/env';
import { ConsoleAnalyticsProvider } from './consoleLogger';
import { AnalyticsProxyProvider } from './providers/proxy';
import type { AnalyticsConfig } from './types';

export function createAnalyticsConfig(): AnalyticsConfig {
  const isDevelopment = env.NODE_ENV === 'development';

  const providers = [
    // Console provider for development/debugging
    new ConsoleAnalyticsProvider(isDevelopment),

    // Proxy provider - secure server-side analytics
    new AnalyticsProxyProvider(),
  ];

  return {
    providers,
    enabledInDevelopment: isDevelopment,
    enableConsoleLogging: isDevelopment,
    bufferEvents: !isDevelopment,
    bufferSize: 50,
  };
}
