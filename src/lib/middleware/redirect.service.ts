import { type NextRequest, NextResponse } from 'next/server';

/**
 * Service responsible for handling redirections
 * Single Responsibility: Redirect logic and URL construction
 */
export class RedirectService {
  createAuthenticationRedirect(
    req: NextRequest,
    callbackPath: string
  ): NextResponse {
    // Redirect directly to Keycloak signin with callback URL
    const signInUrl = new URL('/api/auth/signin/keycloak', req.url);
    signInUrl.searchParams.set('callbackUrl', callbackPath);

    const response = NextResponse.redirect(signInUrl);

    // Clear all NextAuth cookies to prevent stale/chunked cookie issues
    // This ensures a clean authentication state when redirecting to login
    this.clearAllNextAuthCookies(response, req);

    return response;
  }

  /**
   * Clear all NextAuth session cookies including chunked cookies
   * This prevents issues with corrupted/partial cookie data
   */
  private clearAllNextAuthCookies(
    response: NextResponse,
    req: NextRequest
  ): void {
    const cookiePrefix =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

    // Clear main session cookie
    response.cookies.delete(cookiePrefix);

    // Clear all chunked cookies (NextAuth can create multiple chunks like .0, .1, etc.)
    // Scan request cookies to find all chunks
    req.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith(cookiePrefix)) {
        response.cookies.delete(cookie.name);
      }
    });
  }

  createUnauthorizedRedirect(req: NextRequest): NextResponse {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  createCustomRedirect(req: NextRequest, path: string): NextResponse {
    return NextResponse.redirect(new URL(path, req.url));
  }

  createNext(): NextResponse {
    return NextResponse.next();
  }

  isRedirectResponse(response: NextResponse): boolean {
    return response.status >= 300 && response.status < 400;
  }

  getRedirectUrl(response: NextResponse): string | null {
    if (!this.isRedirectResponse(response)) {
      return null;
    }

    return response.headers.get('location');
  }
}
