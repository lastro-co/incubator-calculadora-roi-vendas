import type { NextRequest, NextResponse } from 'next/server';
import type { JWT } from 'next-auth/jwt';

export interface MiddlewareContext {
  req: NextRequest;
  pathname: string;
  token?: JWT | null;
}

export interface SecurityHeaders {
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
}

export interface RouteConfig {
  publicRoutes: string[];
  adminRoutes: string[];
  protectedRoutes: string[];
}

export type MiddlewareHandler = (
  context: MiddlewareContext
) => Promise<NextResponse> | NextResponse;
