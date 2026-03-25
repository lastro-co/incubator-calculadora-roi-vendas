import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import { authOptions } from '../auth/index';

interface CachedSession {
  token: string | null;
  expires: string;
}

export class AuthTokenService {
  private cachedSession: CachedSession | null = null;
  private cookieHeader?: string;

  constructor(cookieHeader?: string) {
    this.cookieHeader = cookieHeader;
  }

  async getAuthToken(): Promise<string | null> {
    // Use cache if the session hasn't expired yet
    if (
      this.cachedSession &&
      new Date(this.cachedSession.expires) > new Date()
    ) {
      return this.cachedSession.token;
    }

    if (typeof window === 'undefined') {
      try {
        const session = await getServerSession(authOptions);
        this.updateCache(session);
        return (session as any)?.accessToken || null;
      } catch {
        return null;
      }
    }

    try {
      const session = await getSession();
      this.updateCache(session);
      return session?.accessToken || null;
    } catch {
      return null;
    }
  }

  private updateCache(session: any): void {
    if (session?.expires && session?.accessToken) {
      this.cachedSession = {
        token: session.accessToken,
        expires: session.expires,
      };
    }
  }

  async injectAuthHeaders(
    headers: HeadersInit = {},
    skipAgencyId = false
  ): Promise<HeadersInit> {
    let baseObj: Record<string, string>;
    if (headers instanceof Headers) {
      baseObj = Object.fromEntries(headers.entries());
    } else if (Array.isArray(headers)) {
      baseObj = Object.fromEntries(headers);
    } else {
      baseObj = headers as Record<string, string>;
    }

    // Check if Authorization header already exists
    const hasExistingAuth =
      'Authorization' in baseObj || 'authorization' in baseObj;

    const baseHeaders: Record<string, string> = { ...baseObj };

    // Only add our token if there's no existing Authorization header
    if (!hasExistingAuth) {
      const token = await this.getAuthToken();
      if (token) {
        baseHeaders.Authorization = `Bearer ${token}`;
      }
    }

    if (!skipAgencyId) {
      const agencyId = process.env.NEXT_PUBLIC_AGENCY_ID || null;

      if (agencyId) {
        return { ...baseHeaders, 'x-agency-id': agencyId };
      }
    }

    return baseHeaders;
  }

  async hasValidToken(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  clearCache(): void {
    this.cachedSession = null;
  }
}
