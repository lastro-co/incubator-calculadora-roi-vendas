import type { DefaultOptions } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { STATUS_CODES } from '@/constants/api/status-codes';
import { logger } from '@/lib/logger';

const MAX_FAILED_FETCH_RETRIES = 3;

export const queryConfigDefault: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      const apiError = error as { status?: number };
      const statusCode = apiError?.status ?? 0;
      const isInternalServerError =
        statusCode >= STATUS_CODES.INTERNAL_SERVER_ERROR;
      const isTooManyRequests = statusCode === STATUS_CODES.TOO_MANY_REQUESTS;
      const isRetryableError = isInternalServerError || isTooManyRequests;
      const isLessThanMaxFailureCount = failureCount < MAX_FAILED_FETCH_RETRIES;

      if (isRetryableError && isLessThanMaxFailureCount) {
        logger.warn('Retrying failed query', {
          failureCount,
          statusCode,
          error: (error as Error).message,
        });
        return true;
      }

      return false;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000), // Exponential backoff
  },
  mutations: {
    retry: false,
    onError: (error) => {
      logger.error('Mutation error', error as Error);
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfigDefault,
});
