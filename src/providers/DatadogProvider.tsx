'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function DatadogProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    // Access env vars directly from process.env for reliable client-side access
    const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
    const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
    const datadogEnv = process.env.NEXT_PUBLIC_DATADOG_ENV;
    const version = process.env.NEXT_PUBLIC_DATADOG_VERSION;
    const site = process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com';
    const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE;
    const NODE_ENV = process.env.NODE_ENV;

    const environment = datadogEnv || NODE_ENV;

    // Initialize Datadog if client token and application ID are provided
    const shouldInitialize =
      typeof window !== 'undefined' && clientToken && applicationId;

    if (shouldInitialize) {
      // Lazy load Datadog RUM to avoid blocking initial page load
      import('@datadog/browser-rum')
        .then(({ datadogRum }) => {
          datadogRum.init({
            applicationId,
            clientToken,
            env: environment,
            ...(version && { version }),
            ...(service && { service }),
            site: site as
              | 'datadoghq.com'
              | 'datadoghq.eu'
              | 'us3.datadoghq.com'
              | 'us5.datadoghq.com'
              | 'ap1.datadoghq.com'
              | 'ddog-gov.com'
              | undefined,
            sessionSampleRate: 100,
            sessionReplaySampleRate: 20, // Reduced from 100 for performance
            trackUserInteractions: true,
            trackResources: true,
            trackLongTasks: true,
            defaultPrivacyLevel: 'mask-user-input',
          });

          datadogRum.startSessionReplayRecording();
        })
        .catch((error) => {
          logger.warn('Failed to load Datadog RUM', { error });
        });
    }
  }, []);

  return <>{children}</>;
}
