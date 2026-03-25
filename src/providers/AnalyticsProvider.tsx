'use client';

import type { PropsWithChildren } from 'react';
import { useRef } from 'react';
import {
  AnalyticsService,
  AnalyticsProvider as BaseAnalyticsProvider,
  createAnalyticsConfig,
} from '@/lib/analytics';
import { logger } from '@/lib/logger';

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const serviceRef = useRef<AnalyticsService | null>(null);

  if (!serviceRef.current) {
    try {
      serviceRef.current = new AnalyticsService(createAnalyticsConfig());
    } catch (error) {
      logger.warn('Failed to initialize analytics', { error });
    }
  }

  if (!serviceRef.current) {
    return <>{children}</>;
  }

  return (
    <BaseAnalyticsProvider analyticsService={serviceRef.current}>
      {children}
    </BaseAnalyticsProvider>
  );
}
