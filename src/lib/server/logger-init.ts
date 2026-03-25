import { logger } from '../logger';
import { getUserContextForLogging } from './user-context';

/**
 * Initialize logger context for server-side requests (API routes, middleware, SSR)
 * Call this at the beginning of API routes or middleware to set agency context
 *
 * @example
 * // In an API route:
 * export async function POST(req: NextRequest) {
 *   initializeLoggerContext();
 *   logger.info('Processing request');
 *   // ... rest of the code
 * }
 *
 * @example
 * // In middleware:
 * export function middleware(req: NextRequest) {
 *   initializeLoggerContext();
 *   // ... rest of the code
 * }
 */
export function initializeLoggerContext(): void {
  try {
    const context = getUserContextForLogging();
    logger.setGlobalContext(context);
  } catch {
    // Silently fail - logging context is optional
  }
}
