/**
 * Utility functions for error handling and formatting
 */

/**
 * Formats an error object for logging, extracting name and message from Error instances
 * while preserving other error types as-is.
 *
 * @param error - The error to format
 * @returns Formatted error object with name and message, or the original error
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   logger.error('Operation failed', { error: formatErrorForLog(error) });
 * }
 */
export function formatErrorForLog(
  error: unknown
): { name: string; message: string } | unknown {
  return error instanceof Error
    ? { name: error.name, message: error.message }
    : error;
}
