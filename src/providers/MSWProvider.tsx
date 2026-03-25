'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface MSWProviderProps {
  children: React.ReactNode;
}

/**
 * MSWProvider - Initializes Mock Service Worker (MSW) on the client
 *
 * This provider:
 * - Initializes MSW only in the browser (not on the server)
 * - Only when NEXT_PUBLIC_ENABLE_MOCKS=true
 * - Waits for MSW to be ready before rendering children
 * - Does not affect SSR or production builds
 */
export function MSWProvider({ children }: MSWProviderProps) {
  const [mswReady, setMswReady] = useState(
    // If MSW is not enabled, start ready
    process.env.NEXT_PUBLIC_ENABLE_MOCKS !== 'true'
  );

  useEffect(() => {
    const initMSW = async () => {
      try {
        if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true') {
          try {
            // @ts-expect-error - Dynamic import path resolution differs between dev and build
            const { initMocks } = await import('@/mocks');
            await initMocks();
          } catch (error) {
            logger.warn(
              'MSW initialization failed, app will run without mocks',
              {
                error,
              }
            );
          }
        }
      } finally {
        // Always allow app to render - avoid blank screen if MSW fails
        setMswReady(true);
      }
    };

    if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true') {
      initMSW();
    }
  }, []);

  // Wait for initialization before rendering
  if (!mswReady) {
    // Return an empty Fragment but not null to satisfy the Provider type
    return <></>;
  }

  return <>{children}</>;
}
