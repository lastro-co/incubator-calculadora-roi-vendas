import { CONTENT_TYPES } from '@/constants/api';
import { STATUS_CODES } from '@/constants/api/status-codes';
import {
  ApiError,
  handleError,
  type StructuredErrorResponse,
} from '../error-handler';
import { logger } from '../logger';
import { AuthTokenService } from './auth-token.service';
import { RequestRetryService } from './retry.service';
import type { FetcherOptions, RetryConfig } from './types';
import { UrlBuilderService } from './url-builder.service';

/**
 * Service responsible for core HTTP client functionality
 * Single Responsibility: HTTP request execution and response handling
 */
export class HttpClientService {
  private retryService = new RequestRetryService();
  private urlBuilder = new UrlBuilderService();

  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    retries: 3,
    delay: 1000,
    backoff: 2,
  };

  async request<T>(
    input: RequestInfo | string,
    options: FetcherOptions = {}
  ): Promise<T> {
    const {
      params,
      timeout = 10_000,
      retries = this.DEFAULT_RETRY_CONFIG.retries,
      headers = {},
      ...init
    } = options;

    try {
      const url = this.urlBuilder.buildUrl(input, params);
      const skipAgencyHeaders = !this.shouldIncludeAgencyId(url);

      // Create AuthTokenService (no cookie header needed for Keycloak mode)
      const authTokenService = new AuthTokenService();

      const authHeaders = await authTokenService.injectAuthHeaders(
        headers,
        skipAgencyHeaders
      );
      const requestHeaders = new Headers(authHeaders as HeadersInit);

      // Smart Content-Type handling - don't override existing or force JSON on binary/form data
      const body: unknown = init.body;
      const hasCT = requestHeaders.has('Content-Type');
      const isForm =
        typeof FormData !== 'undefined' && body instanceof FormData;
      const isSearch =
        typeof URLSearchParams !== 'undefined' &&
        body instanceof URLSearchParams;
      const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
      const isBinary =
        (body as ArrayBufferView)?.buffer != null ||
        body instanceof ArrayBuffer;
      const shouldSetJsonCT =
        body != null && !hasCT && !isForm && !isSearch && !isBlob && !isBinary;

      if (shouldSetJsonCT) {
        requestHeaders.set('Content-Type', CONTENT_TYPES.JSON);
        if (!requestHeaders.has('Accept')) {
          requestHeaders.set('Accept', CONTENT_TYPES.JSON);
        }
      }

      const requestOptions: RequestInit = {
        ...init,
        headers: requestHeaders,
      };

      await this.logRequest(url, requestOptions);

      const response = await this.retryService.fetchWithRetry(
        url,
        requestOptions,
        { ...this.DEFAULT_RETRY_CONFIG, retries },
        timeout
      );

      return await this.handleResponse<T>(response, url);
    } catch (error) {
      const handledError = handleError(error);
      throw handledError;
    }
  }

  private async handleResponse<T>(response: Response, url: string): Promise<T> {
    if (!response.ok) {
      // Handle 401 Unauthorized - let NextAuth handle the redirect
      if (response.status === STATUS_CODES.UNAUTHORIZED) {
        logger.warn('Unauthorized request - session may have expired', {
          url,
          status: response.status,
        });
      }

      // Parse structured error response from BFF
      const errorResponse = await this.parseErrorResponse(response);
      const errorMessage =
        errorResponse?.error ||
        `HTTP ${response.status}: ${response.statusText}`;

      throw new ApiError(errorMessage, response.status, url, errorResponse);
    }

    if (response.status === STATUS_CODES.NO_CONTENT) {
      return {} as T;
    }

    const result = await response.json();

    logger.debug('Request successful', {
      url,
      status: response.status,
    });

    return result;
  }

  private shouldIncludeAgencyId(url: string): boolean {
    const apiUrl = process.env.NEXT_PUBLIC_BFF_URL;

    if (!apiUrl) {
      return false;
    }

    try {
      const apiOrigin = new URL(apiUrl).origin;
      const reqOrigin = new URL(url, apiUrl).origin;
      return reqOrigin === apiOrigin;
    } catch {
      return false;
    }
  }

  private async logRequest(url: string, options: RequestInit): Promise<void> {
    // Create AuthTokenService (no cookie header needed for Keycloak mode)
    const authTokenService = new AuthTokenService();
    const hasToken = await authTokenService.hasValidToken();

    logger.debug('Making request', {
      url,
      method: options.method || 'GET',
      hasToken,
    });
  }

  /**
   * Parse structured error response from BFF
   * Returns undefined if response body is not valid JSON or doesn't have error field
   */
  private async parseErrorResponse(
    response: Response
  ): Promise<StructuredErrorResponse | undefined> {
    try {
      const body = await response.json();
      if (body?.error) {
        return body as StructuredErrorResponse;
      }
      return;
    } catch {
      // Response body is not JSON or empty
      return;
    }
  }
}
