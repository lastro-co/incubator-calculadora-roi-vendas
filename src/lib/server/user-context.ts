import { env } from '../env';

interface UserContext {
  agencyId: string | null;
  [key: string]: unknown;
}

/**
 * Get user context for server-side logging (SSR, API routes, middleware)
 * Returns Agency ID from environment variable
 *
 * @returns {UserContext} User context with agencyId
 *
 * @example
 * const context = getUserContextForLogging();
 * logger.setGlobalContext(context);
 */
export function getUserContextForLogging(): UserContext {
  return {
    agencyId: env.NEXT_PUBLIC_AGENCY_ID || null,
  };
}
