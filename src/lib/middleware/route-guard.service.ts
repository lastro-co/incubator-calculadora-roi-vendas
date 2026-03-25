import type { MiddlewareContext, RouteConfig } from './types';

/**
 * Service responsible for route access control.
 * This application is fully public — no authentication is required.
 */
export class RouteGuardService {
  private config: RouteConfig = {
    // Root '/' makes startsWith match all paths → entire app is public
    publicRoutes: ['/', '/auth/signin', '/auth/error', '/unauthorized', '/api/auth'],
    adminRoutes: [],
    protectedRoutes: [],
  };

  isPublicRoute(pathname: string): boolean {
    return this.config.publicRoutes.some((route) => pathname.startsWith(route));
  }

  isAdminRoute(pathname: string): boolean {
    return this.config.adminRoutes.some((route) => pathname.startsWith(route));
  }

  isProtectedRoute(pathname: string): boolean {
    return !this.isPublicRoute(pathname);
  }

  canAccessRoute(context: MiddlewareContext): {
    canAccess: boolean;
    reason?: 'unauthenticated' | 'insufficient_role';
  } {
    const { pathname, token } = context;

    if (this.isPublicRoute(pathname)) {
      return { canAccess: true };
    }

    if (!token) {
      return { canAccess: false, reason: 'unauthenticated' };
    }

    if (this.isAdminRoute(pathname)) {
      const userRoles = (token as Record<string, unknown>)?.roles as string[] ?? [];
      if (!userRoles.includes('admin')) {
        return { canAccess: false, reason: 'insufficient_role' };
      }
    }

    return { canAccess: true };
  }

  updateRouteConfig(config: Partial<RouteConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
