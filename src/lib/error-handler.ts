import { logger } from './logger';

/**
 * Base application error class with structured error handling.
 *
 * @example
 * throw new AppError('Something went wrong', 'CUSTOM_ERROR', 400);
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(
    message: string,
    code = 'UNKNOWN_ERROR',
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for validation failures.
 *
 * @example
 * throw new ValidationError('Email is required', 'email');
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';

    if (field) {
      logger.warn('Validation error', { field, message });
    }
  }
}

/**
 * Error for network-related failures.
 * These are typically transient errors (offline, CORS, timeouts) that may resolve automatically.
 *
 * @example
 * throw new NetworkError('Connection timeout', '/api/users');
 */
export class NetworkError extends AppError {
  constructor(message: string, url?: string) {
    super(message, 'NETWORK_ERROR', 500);
    this.name = 'NetworkError';

    // Log as WARN instead of ERROR since network errors are often transient
    // and expected in scenarios like offline mode, timeouts, etc.
    logger.warn('Network error', { url, message });
  }
}

/**
 * Error for critical configuration issues that prevent the application from functioning.
 * These are non-recoverable errors that require immediate attention.
 *
 * @example
 * throw new ConfigurationError('Agency ID not configured', { context: 'missing env var' });
 */
export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.name = 'ConfigurationError';

    // Log as ERROR since configuration errors are critical and prevent app functionality
    logger.error('Configuration error - critical setup issue', undefined, {
      message,
      ...details,
    });
  }
}

/**
 * Structured error response from BFF API
 */
export interface StructuredErrorResponse {
  code?: string;
  error: string;
  status?: string;
  category?: 'VALIDATION' | 'TRANSIENT' | 'INTERNAL';
  details?: Record<string, unknown>;
}

/**
 * Error for API-related failures.
 *
 * @example
 * throw new ApiError('User not found', 404, '/api/users/123');
 */
export class ApiError extends AppError {
  readonly endpoint?: string;
  readonly category?: 'VALIDATION' | 'TRANSIENT' | 'INTERNAL';
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    endpoint?: string,
    errorResponse?: StructuredErrorResponse
  ) {
    super(message, errorResponse?.code || 'API_ERROR', statusCode);
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.category = errorResponse?.category;
    this.details = errorResponse?.details;

    logger.error('API error', undefined, {
      endpoint,
      statusCode,
      message,
      code: errorResponse?.code,
      category: errorResponse?.category,
    });
  }
}

/**
 * Converts any error type into a standardized AppError.
 *
 * @param {unknown} error - The error to handle
 * @returns {AppError} Standardized application error
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   const appError = handleError(err);
 *   throw appError;
 * }
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    logger.error('Unhandled error', error);
    return new AppError(error.message, 'UNHANDLED_ERROR', 500, false);
  }

  logger.error('Unknown error type', undefined, { error });
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500, false);
}
