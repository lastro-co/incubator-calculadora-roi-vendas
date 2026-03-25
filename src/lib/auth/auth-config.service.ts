import type { AuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { env, getNextAuthUrl } from '../env';
import { isKeycloakEnabled } from './auth-mode.config';
import { AUTH_ERRORS } from './constants';
import { KeycloakService } from './keycloak.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

/**
 * Service responsible for NextAuth configuration
 * Single Responsibility: NextAuth setup and callback orchestration
 */
export class AuthConfigService {
  private tokenService = new TokenService();
  private sessionService = new SessionService();
  private keycloakService = new KeycloakService();

  getAuthOptions(): AuthOptions {
    // Set NEXTAUTH_URL if not already set - NextAuth reads this directly from process.env
    if (!process.env.NEXTAUTH_URL) {
      process.env.NEXTAUTH_URL = getNextAuthUrl();
    }
    // If Keycloak is disabled, return minimal configuration
    if (!isKeycloakEnabled()) {
      return {
        providers: [],
        session: {
          strategy: 'jwt',
        },
        callbacks: {
          jwt: ({ token }) => token,
          session: ({ session }) => session,
        },
        debug: env.NODE_ENV === 'development',
      };
    }

    const keycloakConfig = this.keycloakService.getKeycloakConfig();

    return {
      providers: [
        KeycloakProvider({
          clientId: keycloakConfig.clientId,
          clientSecret: keycloakConfig.clientSecret,
          issuer: keycloakConfig.issuer,
          authorization: {
            params: keycloakConfig.authorizationParams,
          },
        }),
      ],
      callbacks: {
        jwt: ({ token, account, user }) =>
          this.handleJwtCallback(token, account, user),
        session: ({ session, token }) =>
          this.handleSessionCallback(session, token),
      },
      events: {
        signOut: ({ token }) => this.handleSignOut(token),
      },
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
      session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
      cookies: {
        sessionToken: {
          name:
            env.NODE_ENV === 'production'
              ? '__Secure-next-auth.session-token'
              : 'next-auth.session-token',
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: env.NODE_ENV === 'production',
          },
        },
      },
      debug: env.NODE_ENV === 'development',
    };
  }

  private handleJwtCallback(
    token: JWT,
    account: any,
    user: any
  ): Promise<JWT> | JWT {
    if (account && user) {
      // Initial sign in
      return {
        ...token,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        idToken: account.id_token,
        expiresAt: (account.expires_at ?? 0) * 1000,
        roles:
          ((user as unknown as Record<string, unknown>).roles as string[]) ||
          [],
      };
    }

    // Return previous token if the access token has not expired yet
    if (!this.tokenService.isTokenExpired(token)) {
      return token;
    }

    // Access token has expired, try to update it
    return this.tokenService.refreshAccessToken(token);
  }

  private async handleSessionCallback(session: any, token: JWT) {
    // Validate token with Keycloak if available
    if (this.tokenService.hasValidAccessToken(token)) {
      const isValid = await this.sessionService.isValidSession(token);

      if (!isValid) {
        return {
          ...session,
          error: AUTH_ERRORS.TOKEN_VALIDATION_ERROR,
        };
      }
    }

    return {
      ...session,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      idToken: token.idToken,
      roles: token.roles,
      error: token.error,
    };
  }

  private async handleSignOut(token: any) {
    if (token?.idToken) {
      await this.keycloakService.performLogout(token.idToken);
    }
  }
}
