'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { logger } from '@/lib/logger';

/**
 * Component that sets Agency ID in Datadog based on authentication state.
 */
export function DatadogUserContext() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const agencyId = process.env.NEXT_PUBLIC_AGENCY_ID || null;

    if (isAuthenticated && agencyId) {
      logger.setGlobalContext({
        agencyId,
      });

      logger.debug('Agency context set in Datadog', { agencyId });
    } else if (!isAuthenticated) {
      logger.clearGlobalContext();
      logger.debug('Agency context cleared in Datadog');
    }
  }, [isAuthenticated]);

  return null;
}
