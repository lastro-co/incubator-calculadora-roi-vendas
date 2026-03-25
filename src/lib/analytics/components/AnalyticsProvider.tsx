'use client';

import type { PropsWithChildren } from 'react';
import type { AnalyticsService } from '../analytics.service';
import { AnalyticsReactContext } from '../hooks/useAnalytics';

interface AnalyticsProviderProps extends PropsWithChildren {
  analyticsService: AnalyticsService;
}

export function AnalyticsContextProvider({
  children,
  analyticsService,
}: AnalyticsProviderProps) {
  return (
    <AnalyticsReactContext.Provider value={{ analyticsService }}>
      {children}
    </AnalyticsReactContext.Provider>
  );
}
