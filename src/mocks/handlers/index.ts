/**
 * Barrel export for all mock handlers.
 *
 * When adding a new feature's handlers, import them here and
 * add them to the `mockHandlers` array. Then register them in
 * `src/tests/handlers.ts` to make them available to both
 * the MSW browser worker and the test server.
 *
 * @example
 * import { orderHandlers } from './order.handlers';
 *
 * export const mockHandlers = [
 *   ...userHandlers,
 *   ...orderHandlers,
 * ];
 */
import type { RequestHandler } from 'msw';
import { userHandlers } from './user.handlers';

export const mockHandlers: RequestHandler[] = [...userHandlers];
