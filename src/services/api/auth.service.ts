import type { KeycloakUserInfo } from '@/lib/auth/types';
import { env } from '@/lib/env';
import { ApiError } from '@/lib/error-handler';
import { BaseApiService } from './base.service';

class AuthService extends BaseApiService {
  /**
   * Fetch user info from Keycloak's userinfo endpoint
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    const keycloakUrl = env.NEXT_PUBLIC_KEYCLOAK_URL;
    const realm = env.NEXT_PUBLIC_KEYCLOAK_REALM;

    if (!keycloakUrl || !realm) {
      throw new ApiError(
        'Keycloak URL or realm not configured',
        500,
        'keycloak/userinfo'
      );
    }

    const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`;

    return this.get<KeycloakUserInfo>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

export const authService = new AuthService();
