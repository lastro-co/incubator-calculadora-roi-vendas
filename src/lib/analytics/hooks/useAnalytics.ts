import { createContext, useCallback, useContext, useMemo } from 'react';
import { logger } from '@/lib/logger';
import type { AnalyticsService } from '../analytics.service';
import type {
  AnalyticsContext,
  AnalyticsEventName,
  StandardAnalyticsProperties,
} from '../types';

interface AnalyticsContextValue {
  analyticsService: AnalyticsService;
}

export const AnalyticsReactContext =
  createContext<AnalyticsContextValue | null>(null);

export interface UseAnalyticsReturn {
  track: (
    name: AnalyticsEventName,
    properties?: StandardAnalyticsProperties & Record<string, any>
  ) => Promise<void>;
  identify: (userId: string, properties?: Record<string, any>) => Promise<void>;
  page: (name: string, properties?: Record<string, any>) => Promise<void>;
  group: (groupId: string, properties?: Record<string, any>) => Promise<void>;
  alias: (newId: string, previousId?: string) => Promise<void>;
  reset: () => Promise<void>;
  flush: () => Promise<void>;
  setContext: (context: Partial<AnalyticsContext>) => void;
  getContext: () => AnalyticsContext;
  clearContext: () => void;
  isEnabled: boolean;
}

export function useAnalytics(): UseAnalyticsReturn {
  const context = useContext(AnalyticsReactContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  const { analyticsService } = context;

  const track = useCallback(
    async (
      name: AnalyticsEventName,
      properties?: StandardAnalyticsProperties & Record<string, any>
    ) => {
      await analyticsService.track(name, properties);
    },
    [analyticsService]
  );

  const identify = useCallback(
    async (userId: string, properties?: Record<string, any>) => {
      await analyticsService.identify(userId, properties);
    },
    [analyticsService]
  );

  const page = useCallback(
    async (name: string, properties?: Record<string, any>) => {
      await analyticsService.page(name, properties);
    },
    [analyticsService]
  );

  const group = useCallback(
    async (groupId: string, properties?: Record<string, any>) => {
      await analyticsService.group(groupId, properties);
    },
    [analyticsService]
  );

  const alias = useCallback(
    async (newId: string, previousId?: string) => {
      await analyticsService.alias(newId, previousId);
    },
    [analyticsService]
  );

  const reset = useCallback(async () => {
    await analyticsService.reset();
  }, [analyticsService]);

  const flush = useCallback(async () => {
    await analyticsService.flush();
  }, [analyticsService]);

  const setContext = useCallback(
    (context: Partial<AnalyticsContext>) => {
      analyticsService.setContext(context);
    },
    [analyticsService]
  );

  const getContext = useCallback(() => {
    return analyticsService.getContext();
  }, [analyticsService]);

  const clearContext = useCallback(() => {
    analyticsService.clearContext();
  }, [analyticsService]);

  const isEnabled = analyticsService
    .getProviders()
    .some((provider) => provider.isEnabled);

  return {
    track,
    identify,
    page,
    group,
    alias,
    reset,
    flush,
    setContext,
    getContext,
    clearContext,
    isEnabled,
  };
}

/**
 * Safe version of useAnalytics that doesn't throw if provider is not available
 * Returns no-op functions if analytics fails to load
 *
 * Use this in critical components (like auth providers) where analytics failure
 * should not break the component functionality
 */
export function useAnalyticsSafe(): UseAnalyticsReturn {
  const context = useContext(AnalyticsReactContext);

  return useMemo(() => {
    // If no context, return no-op implementation
    if (!context) {
      logger.warn(
        'Analytics context not available, using no-op implementation'
      );

      // Return no-op implementation that doesn't break the app
      return {
        track: async () => {
          /* no-op */
        },
        identify: async () => {
          /* no-op */
        },
        page: async () => {
          /* no-op */
        },
        group: async () => {
          /* no-op */
        },
        alias: async () => {
          /* no-op */
        },
        reset: async () => {
          /* no-op */
        },
        flush: async () => {
          /* no-op */
        },
        setContext: () => {
          /* no-op */
        },
        getContext: () => ({
          userId: undefined,
          sessionId: undefined,
          properties: {},
        }),
        clearContext: () => {
          /* no-op */
        },
        isEnabled: false,
      };
    }

    // Context available, use normal implementation
    const { analyticsService } = context;

    return {
      track: async (
        name: AnalyticsEventName,
        properties?: StandardAnalyticsProperties & Record<string, any>
      ) => {
        await analyticsService.track(name, properties);
      },
      identify: async (userId: string, properties?: Record<string, any>) => {
        await analyticsService.identify(userId, properties);
      },
      page: async (name: string, properties?: Record<string, any>) => {
        await analyticsService.page(name, properties);
      },
      group: async (groupId: string, properties?: Record<string, any>) => {
        await analyticsService.group(groupId, properties);
      },
      alias: async (newId: string, previousId?: string) => {
        await analyticsService.alias(newId, previousId);
      },
      reset: async () => {
        await analyticsService.reset();
      },
      flush: async () => {
        await analyticsService.flush();
      },
      setContext: (ctx: Partial<AnalyticsContext>) => {
        analyticsService.setContext(ctx);
      },
      getContext: () => {
        return analyticsService.getContext();
      },
      clearContext: () => {
        analyticsService.clearContext();
      },
      isEnabled: analyticsService
        .getProviders()
        .some((provider) => provider.isEnabled),
    };
  }, [context]);
}
