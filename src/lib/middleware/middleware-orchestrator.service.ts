import type { NextRequest, NextResponse } from 'next/server';
import { isKeycloakEnabled } from '../auth/auth-mode.config';
import { logger } from '../logger';
import { AuthenticationCheckerService } from './auth-checker.service';
import { RedirectService } from './redirect.service';
import { RouteGuardService } from './route-guard.service';
import { SecurityHeadersService } from './security-headers.service';
import type { MiddlewareContext } from './types';

/**
 * Service responsible for orchestrating all middleware concerns
 * Single Responsibility: Middleware composition and execution flow
 */
export class MiddlewareOrchestratorService {
  private routeGuard = new RouteGuardService();
  private securityHeaders = new SecurityHeadersService();
  private authChecker = new AuthenticationCheckerService();
  private redirectService = new RedirectService();

  async processRequest(req: NextRequest): Promise<NextResponse> {
    const pathname = req.nextUrl.pathname;

    // Get authentication token
    const token = await this.authChecker.getAuthToken(req);

    // Create context
    const context: MiddlewareContext = {
      req,
      pathname,
      token,
    };

    // Check route access
    const accessCheck = this.routeGuard.canAccessRoute(context);

    let response: NextResponse;

    if (accessCheck.canAccess) {
      // For protected routes with Keycloak, validate token
      if (
        isKeycloakEnabled() &&
        token &&
        this.routeGuard.isProtectedRoute(pathname)
      ) {
        const isValid = this.authChecker.validateKeycloakToken(token);

        if (!isValid) {
          logger.warn('Token validation failed, redirecting to login', {
            pathname,
          });
          return this.redirectService.createAuthenticationRedirect(
            req,
            pathname
          );
        }

        // Check if token needs refresh
        if (this.authChecker.needsTokenRefresh(token)) {
          logger.info(
            'Token needs refresh, NextAuth will handle automatically',
            {
              pathname,
            }
          );
        }
      }

      response = this.redirectService.createNext();
    } else {
      response = this.handleAccessDenied(context, accessCheck.reason);
    }

    // Apply security headers to all responses
    response = this.securityHeaders.applySecurityHeaders(response);

    return response;
  }

  private handleAccessDenied(
    context: MiddlewareContext,
    reason?: 'unauthenticated' | 'insufficient_role'
  ): NextResponse {
    const { req, pathname } = context;

    switch (reason) {
      case 'unauthenticated':
        return this.redirectService.createAuthenticationRedirect(req, pathname);

      case 'insufficient_role':
        return this.redirectService.createUnauthorizedRedirect(req);

      default:
        return this.redirectService.createUnauthorizedRedirect(req);
    }
  }

  // Allow external configuration of services
  getRouteGuard(): RouteGuardService {
    return this.routeGuard;
  }

  getSecurityHeaders(): SecurityHeadersService {
    return this.securityHeaders;
  }

  getAuthChecker(): AuthenticationCheckerService {
    return this.authChecker;
  }

  getRedirectService(): RedirectService {
    return this.redirectService;
  }
}
