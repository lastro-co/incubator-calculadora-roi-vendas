import type { JWT } from 'next-auth/jwt';
import { CONTENT_TYPES } from '@/constants/api';
import { env } from '../env';
import { AUTH_ERRORS } from './constants';
import type { TokenRefreshResponse } from './types';

/**
 * Service responsible for token management operations
 * Single Responsibility: Token refresh and lifecycle management
 */
export class TokenService {
  async refreshAccessToken(token: JWT): Promise<JWT> {
    try {
      const requestBody = {
        client_id: env.KEYCLOAK_ID,
        client_secret: env.KEYCLOAK_SECRET,
        grant_type: 'refresh_token' as const,
        refresh_token: token.refreshToken ?? '',
      };

      const response = await fetch(
        `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': CONTENT_TYPES.FORM_URL_ENCODED,
          },
          body: new URLSearchParams(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const refreshedTokens: TokenRefreshResponse = await response.json();

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        idToken: refreshedTokens.id_token,
      };
    } catch (_error) {
      return {
        ...token,
        error: AUTH_ERRORS.REFRESH_ACCESS_TOKEN_ERROR,
      };
    }
  }

  isTokenExpired(token: JWT): boolean {
    return Date.now() >= (token.expiresAt || 0);
  }

  hasValidAccessToken(token: JWT): boolean {
    return !!(token.accessToken && !token.error && !this.isTokenExpired(token));
  }
}
