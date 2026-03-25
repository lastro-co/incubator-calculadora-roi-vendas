export interface FetcherOptions extends RequestInit {
  /** Query parameters to append to the URL */
  params?: Record<string, string | number>;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Number of retry attempts (default: 3) */
  retries?: number;
}

export interface RetryConfig {
  retries: number;
  delay: number;
  backoff: number;
}

export interface HttpRequestConfig {
  url: string;
  options: RequestInit;
  timeout?: number;
  retryConfig?: RetryConfig;
}
