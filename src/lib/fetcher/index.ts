// Main HTTP client service

export { AuthTokenService } from './auth-token.service';
export { HttpClientService } from './http-client.service';
export { RequestRetryService } from './retry.service';
// Individual services for advanced usage
export { RequestTimeoutService } from './timeout.service';
// Types
export type { FetcherOptions, HttpRequestConfig, RetryConfig } from './types';
export { UrlBuilderService } from './url-builder.service';

// Create and export the main fetcher function
import { HttpClientService } from './http-client.service';

const httpClient = new HttpClientService();

/**
 * Enhanced HTTP client with automatic retry, timeout, and error handling.
 * Supports automatic Bearer token injection from localStorage.
 *
 * @template T - The expected response type
 * @param {RequestInfo | string} input - URL or Request object
 * @param {FetcherOptions} [options={}] - Request configuration options
 * @returns {Promise<T>} Typed response data
 *
 * @example
 * // Simple GET request
 * const user = await fetcher<User>('/api/users/123');
 *
 * @example
 * // POST with body and custom options
 * const newUser = await fetcher<User>('/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
 *   timeout: 5000,
 *   retries: 1
 * });
 *
 * @example
 * // With query parameters
 * const users = await fetcher<User[]>('/api/users', {
 *   params: { page: 1, limit: 10, search: 'john' }
 * });
 */
export async function fetcher<T>(
  input: RequestInfo | string,
  options?: import('./types').FetcherOptions
): Promise<T> {
  return httpClient.request<T>(input, options);
}
