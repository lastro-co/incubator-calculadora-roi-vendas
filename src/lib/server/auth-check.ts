import { logger } from '../logger';

/**
 * Wrapper for server-side data fetching
 */
export async function serverSideFetch<T>(
  fetchFn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Server-side fetch failed, will fallback to client-side', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return fallbackValue;
  }
}
