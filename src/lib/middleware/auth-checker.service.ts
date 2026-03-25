import type { NextRequest } from 'next/server';
import type { JWT } from 'next-auth/jwt';
import { getToken } from 'next-auth/jwt';
import { isKeycloakEnabled } from '../auth/auth-mode.config';
import { logger } from '../logger';

/**
 * Service responsible for authentication validation
 * Single Responsibility: User authentication verification
 */
export class AuthenticationCheckerService {
  async getAuthToken(req: NextRequest): Promise<JWT | null> {
    try {
      return await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    } catch (error) {
      logger.error('Error getting auth token', {
        error: (error as Error).message,
      });
      return null;
    }
  }

  isAuthenticated(token: JWT | null): boolean {
    return !!token;
  }

  hasRequiredRole(token: JWT | null, requiredRole: string): boolean {
    if (!token) {
      return false;
    }

    const userRoles = (token as any)?.roles || [];
    return userRoles.includes(requiredRole);
  }

  hasAnyRole(token: JWT | null, roles: string[]): boolean {
    if (!token) {
      return false;
    }

    const userRoles = (token as any)?.roles || [];
    return roles.some((role) => userRoles.includes(role));
  }

  getUserRoles(token: JWT | null): string[] {
    if (!token) {
      return [];
    }

    return (token as any)?.roles || [];
  }

  isTokenValid(token: JWT | null): boolean {
    if (!token) {
      return false;
    }

    // Check if token has an error
    if ((token as any)?.error) {
      return false;
    }

    return true;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: JWT | null): boolean {
    if (!token) {
      return true;
    }

    const expiresAt = (token as any)?.expiresAt;
    if (!expiresAt) {
      return false; // If no expiration, assume valid
    }

    return Date.now() >= expiresAt;
  }

  /**
   * Check if token needs refresh (for Keycloak mode only)
   * Returns true if token is expired or about to expire (within 5 minutes)
   */
  needsTokenRefresh(token: JWT | null): boolean {
    if (!isKeycloakEnabled() || !token) {
      return false;
    }

    const expiresAt = (token as any)?.expiresAt;
    if (!expiresAt) {
      return false;
    }

    // Refresh if token expires in less than 5 minutes
    const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() + REFRESH_THRESHOLD >= expiresAt;
  }

  /**
   * Validate token for Keycloak mode
   * Checks if token is valid and not expired
   */
  validateKeycloakToken(token: JWT | null): boolean {
    if (!isKeycloakEnabled()) {
      return true; // Skip validation when Keycloak is disabled
    }

    if (!this.isTokenValid(token)) {
      logger.warn('Token is invalid');
      return false;
    }

    if (this.isTokenExpired(token)) {
      logger.warn('Token is expired');
      return false;
    }

    return true;
  }
}
