import { STATUS_CODES } from '@/constants/api/status-codes';
import { ApiError, NetworkError } from '../error-handler';
import { logger } from '../logger';
import { RequestTimeoutService } from './timeout.service';
import type { RetryConfig } from './types';

/**
 * Service responsible for retry logic with exponential backoff
 * Single Responsibility: Request retry management
 */
export class RequestRetryService {
  private timeoutService = new RequestTimeoutService();

  isRetryableError(status: number): boolean {
    return (
      status >= STATUS_CODES.INTERNAL_SERVER_ERROR ||
      status === STATUS_CODES.TOO_MANY_REQUESTS
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchWithRetry(
    url: string,
    options: RequestInit,
    retryConfig: RetryConfig,
    timeout?: number,
    attempt = 0
  ): Promise<Response> {
    try {
      logger.debug('Fetch attempt', {
        url,
        attempt,
        retries: retryConfig.retries,
      });

      const response = await this.timeoutService.fetchWithTimeout(
        url,
        options,
        timeout
      );

      if (response.ok || !this.isRetryableError(response.status)) {
        return response;
      }

      if (attempt >= retryConfig.retries) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url
        );
      }

      const delayMs = retryConfig.delay * retryConfig.backoff ** attempt;
      logger.warn('Request failed, retrying', {
        url,
        attempt,
        status: response.status,
        delayMs,
      });

      await this.delay(delayMs);
      return this.fetchWithRetry(
        url,
        options,
        retryConfig,
        timeout,
        attempt + 1
      );
    } catch (error) {
      const err = error as Error;
      const message =
        typeof err.message === 'string' ? err.message.toLowerCase() : '';

      const isNetworkError =
        error instanceof NetworkError ||
        message === 'failed to fetch' ||
        (error instanceof TypeError &&
          (message.includes('fetch') || message.includes('network')));

      // Don't retry network errors (CORS, CSP, etc) - they won't succeed on retry
      if (isNetworkError) {
        // If not already a NetworkError, convert it to avoid duplicate logs
        // NetworkError constructor will log the error
        if (error instanceof NetworkError) {
          logger.debug('NetworkError caught - not retrying', {
            url,
            attempt,
          });
          throw err;
        }
        // Convert to NetworkError so it's logged consistently
        throw new NetworkError(`Network error: ${err.message}`, url);
      }

      if (
        attempt >= retryConfig.retries ||
        !this.isRetryableError((error as { status?: number }).status ?? 0)
      ) {
        throw err;
      }

      const delayMs = retryConfig.delay * retryConfig.backoff ** attempt;
      logger.warn('Request failed, retrying', {
        url,
        attempt,
        error: err.message,
        delayMs,
      });

      await this.delay(delayMs);
      return this.fetchWithRetry(
        url,
        options,
        retryConfig,
        timeout,
        attempt + 1
      );
    }
  }
}
