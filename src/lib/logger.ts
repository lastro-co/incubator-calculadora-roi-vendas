import { env } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface GlobalContext {
  agencyId?: string | null;
  [key: string]: unknown;
}

/**
 * Structured logger with environment-aware logging levels and context support.
 * Integrates with Datadog RUM for client-side logging.
 */
class Logger {
  private isDevelopment = env.NODE_ENV === 'development';
  private isTest = env.NODE_ENV === 'test';
  private globalContext: GlobalContext = {};

  private shouldLog(level: LogLevel): boolean {
    if (this.isTest) {
      return false;
    }

    if (!this.isDevelopment && level === 'debug') {
      return false;
    }

    return true;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Merge global context with message context
    const mergedContext = {
      ...this.globalContext,
      ...context,
    };

    if (mergedContext && Object.keys(mergedContext).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(mergedContext)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Set global context that will be included in all log messages.
   * Also updates Datadog RUM context if available (client-side only).
   *
   * @param {GlobalContext} context - Global context data (e.g., agencyId)
   *
   * @example
   * logger.setGlobalContext({ agencyId: 'agency-123' });
   */
  setGlobalContext(context: GlobalContext): void {
    this.globalContext = { ...this.globalContext, ...context };

    // Update Datadog RUM context if available (client-side only)
    if (typeof window !== 'undefined') {
      import('@datadog/browser-rum')
        .then(({ datadogRum }) => {
          if (context.agencyId) {
            datadogRum.setGlobalContextProperty('agencyId', context.agencyId);
          }
          // Add any other context properties
          Object.entries(context).forEach(([key, value]) => {
            if (key !== 'agencyId' && value !== undefined) {
              datadogRum.setGlobalContextProperty(key, value);
            }
          });
        })
        .catch(() => {
          // Silently fail if Datadog is not available
        });
    }
  }

  /**
   * Clear global context.
   * Also clears Datadog RUM context if available (client-side only).
   *
   * @example
   * logger.clearGlobalContext();
   */
  clearGlobalContext(): void {
    const keysToRemove = Object.keys(this.globalContext);
    this.globalContext = {};

    // Clear Datadog RUM context if available (client-side only)
    if (typeof window !== 'undefined') {
      import('@datadog/browser-rum')
        .then(({ datadogRum }) => {
          keysToRemove.forEach((key) => {
            datadogRum.removeGlobalContextProperty(key);
          });
        })
        .catch(() => {
          // Silently fail if Datadog is not available
        });
    }
  }

  /**
   * Log debug messages (only in development).
   *
   * @param {string} message - Debug message
   * @param {LogContext} [context] - Additional context data
   *
   * @example
   * logger.debug('User login attempt', { userId: '123', ip: '192.168.1.1' });
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      // biome-ignore lint/suspicious/noConsole: Debug
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log informational messages.
   *
   * @param {string} message - Info message
   * @param {LogContext} [context] - Additional context data
   *
   * @example
   * logger.info('User successfully logged in', { userId: '123' });
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      // biome-ignore lint/suspicious/noConsole: Info
      console.info(this.formatMessage('info', message, context));
    }
  }

  /**
   * Log warning messages.
   *
   * @param {string} message - Warning message
   * @param {LogContext} [context] - Additional context data
   *
   * @example
   * logger.warn('API rate limit approaching', { remaining: 10, userId: '123' });
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      // biome-ignore lint/suspicious/noConsole: Warn
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  /**
   * Log error messages with optional Error object.
   *
   * @param {string} message - Error message
   * @param {Error | unknown} [error] - Error object for stack trace
   * @param {LogContext} [context] - Additional context data
   *
   * @example
   * logger.error('Failed to process payment', error, { orderId: '456', userId: '123' });
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }),
      };
      // biome-ignore lint/suspicious/noConsole: Error
      console.error(this.formatMessage('error', message, errorContext));
    }
  }
}

/**
 * Singleton logger instance with structured logging capabilities.
 *
 * @example
 * import { logger } from '@/lib/logger';
 *
 * logger.info('Application started');
 * logger.error('Database connection failed', error);
 * logger.debug('Processing request', { method: 'POST', path: '/api/users' });
 */
export const logger = new Logger();
