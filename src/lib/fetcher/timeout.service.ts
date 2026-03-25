import { NetworkError } from '../error-handler';

/**
 * Service responsible for handling request timeouts
 * Single Responsibility: Timeout management for HTTP requests
 */
export class RequestTimeoutService {
  async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 10_000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      const err = error as Error;

      if (err.name === 'AbortError') {
        throw new NetworkError('Request timeout', url);
      }

      // Enhanced error handling for "Failed to fetch" errors
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        // NetworkError constructor will log the error, so we don't need to log here
        throw new NetworkError(
          `Network request failed: ${err.message}. This may be due to CORS, network connectivity, or security policies.`,
          url
        );
      }

      throw error;
    }
  }
}
