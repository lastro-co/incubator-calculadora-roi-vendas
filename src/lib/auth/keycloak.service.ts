import { env, getNextAuthUrl } from '../env';
import { logger } from '../logger';

/**
 * Service responsible for Keycloak-specific operations
 * Single Responsibility: Keycloak integration and logout management
 */
export class KeycloakService {
  async performLogout(idToken: string): Promise<void> {
    try {
      const logoutUrl = new URL(
        `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
      );
      logoutUrl.searchParams.set('id_token_hint', idToken);
      logoutUrl.searchParams.set('post_logout_redirect_uri', getNextAuthUrl());

      await fetch(logoutUrl.toString(), { method: 'GET' });
    } catch (error) {
      // Logout error ignored - continue with NextAuth logout
      logger.warn('Keycloak logout failed', {
        error: (error as Error).message,
      });
    }
  }

  getKeycloakConfig() {
    return {
      clientId: env.KEYCLOAK_ID,
      clientSecret: env.KEYCLOAK_SECRET,
      issuer: env.KEYCLOAK_ISSUER,
      authorizationParams: {
        scope: 'openid email profile',
      },
    };
  }
}
