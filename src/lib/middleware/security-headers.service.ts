import type { NextResponse } from 'next/server';
import { URLS } from '@/constants/urls';
import { getAllAnalyticsEndpoints } from '../analytics/endpoints.config';
import { env } from '../env';
import {
  getDatadogEndpoints,
  getDevelopmentEndpoints,
  getGoogleEndpoints,
} from '../security';
import type { SecurityHeaders } from './types';

/**
 * Service responsible for managing security headers
 * Single Responsibility: Security header configuration and application
 */
export class SecurityHeadersService {
  private defaultHeaders: SecurityHeaders = {
    'X-Frame-Options': this.getFrameOptions(),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': this.buildCSPHeader(),
  };

  private getFrameOptions(): string {
    // Always DENY - we control frame embedding via CSP frame-ancestors
    return 'DENY';
  }

  private buildCSPHeader(): string {
    // Use validated env instead of direct process.env access
    const keycloakUrl = env.NEXT_PUBLIC_KEYCLOAK_URL
      ? new URL(env.NEXT_PUBLIC_KEYCLOAK_URL).origin
      : '';

    const apiUrls: string[] = [];
    // Use zod-validated env which ensures URL is valid
    const apiOrigin = new URL(env.NEXT_PUBLIC_BFF_URL).origin;
    apiUrls.push(apiOrigin);

    let chatSocketUrl: string | null = null;
    if (env.NEXT_PUBLIC_CHAT_SOCKET_URL) {
      try {
        chatSocketUrl = new URL(env.NEXT_PUBLIC_CHAT_SOCKET_URL).origin;
      } catch {
        // Handle gracefully if somehow invalid URL passes validation
        chatSocketUrl = null;
      }
    }

    // External service endpoints from centralized configuration
    const datadogEndpoints = getDatadogEndpoints(env.NEXT_PUBLIC_DATADOG_SITE);
    const googleEndpoints = getGoogleEndpoints();

    // Analytics endpoints from centralized configuration
    const analyticsEndpoints = getAllAnalyticsEndpoints();

    const isDev = env.NODE_ENV === 'development';
    const developmentEndpoints = getDevelopmentEndpoints(isDev);

    const connectSrcUrls = [
      "'self'",
      keycloakUrl,
      ...apiUrls,
      ...developmentEndpoints,
      ...(chatSocketUrl ? [chatSocketUrl] : []),
      ...datadogEndpoints.connectSrc,
      ...analyticsEndpoints,
    ].join(' ');

    const scriptSrcUrls = [
      "'self'",
      "'unsafe-inline'", // Required for Next.js inline scripts in production
      ...(isDev ? ["'unsafe-eval'"] : []), // Only allow eval in development
      ...datadogEndpoints.scriptSrc,
    ].join(' ');

    // Frame ancestors for iframe embedding
    const frameAncestors = isDev
      ? "frame-ancestors 'self' http://localhost:* https://localhost:* file://*"
      : `frame-ancestors 'self' ${URLS.APP_PRODUCTION} https://*.vercel.app`;

    const cspDirectives = [
      "default-src 'self'",
      `script-src ${scriptSrcUrls}`,
      `style-src 'self' 'unsafe-inline' ${googleEndpoints[0]}`, // Google Fonts API
      `font-src 'self' ${googleEndpoints[1]}`, // Google Fonts static
      "img-src 'self' data: blob:",
      `connect-src ${connectSrcUrls}`,
      frameAncestors,
    ];

    return cspDirectives.join('; ');
  }

  applySecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(this.defaultHeaders).forEach(([header, value]) => {
      response.headers.set(header, value);
    });

    return response;
  }

  updateCSPDirective(directive: string, value: string): void {
    const currentCSP = this.defaultHeaders['Content-Security-Policy'];
    const directives = currentCSP.split('; ');

    const directiveIndex = directives.findIndex((d) => d.startsWith(directive));

    if (directiveIndex >= 0) {
      directives[directiveIndex] = `${directive} ${value}`;
    } else {
      directives.push(`${directive} ${value}`);
    }

    this.defaultHeaders['Content-Security-Policy'] = directives.join('; ');
  }

  updateHeader(header: keyof SecurityHeaders, value: string): void {
    this.defaultHeaders[header] = value;
  }

  getHeaders(): SecurityHeaders {
    return { ...this.defaultHeaders };
  }
}
