import type { JWT } from 'next-auth/jwt';
import { env } from '../env';
import type { AuthError } from './constants';
import type { KeycloakUserInfo } from './types';

/**
 * Service responsible for session validation and user info management
 * Single Responsibility: Session validation and user data retrieval
 */
export class SessionService {
  async validateTokenWithKeycloak(
    accessToken: string
  ): Promise<KeycloakUserInfo | null> {
    try {
      const response = await fetch(
        `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  async isValidSession(token: JWT): Promise<boolean> {
    if (!token.accessToken || token.error) {
      return false;
    }

    const userInfo = await this.validateTokenWithKeycloak(token.accessToken);
    return userInfo !== null;
  }

  createSessionError(errorType: AuthError) {
    return { error: errorType };
  }
}
