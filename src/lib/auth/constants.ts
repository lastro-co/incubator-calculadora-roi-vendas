/**
 * Authentication error constants
 * Centralized constants to avoid magic strings throughout the auth system
 */
export const AUTH_ERRORS = {
  TOKEN_EXPIRED: 'TokenExpired',
  TOKEN_VALIDATION_ERROR: 'TokenValidationError',
  REFRESH_ACCESS_TOKEN_ERROR: 'RefreshAccessTokenError',
} as const;

export type AuthError = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

/**
 * Checks if the session error is a token-related authentication error that requires re-authentication
 * @param error - The session error to check
 * @returns true if the error is a token auth error, false otherwise
 */
export function isTokenAuthError(error?: string | null): boolean {
  return (
    error === AUTH_ERRORS.TOKEN_EXPIRED ||
    error === AUTH_ERRORS.TOKEN_VALIDATION_ERROR ||
    error === AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR
  );
}
