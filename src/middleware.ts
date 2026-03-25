import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { processMiddleware } from '@/lib/middleware';

export async function middleware(req: NextRequest) {
  // Allow CORS preflight requests to pass through immediately
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  return processMiddleware(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - excluded by default for NextAuth and other APIs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - favicon (favicon folder)
     * - public folder
     * - mockServiceWorker.js (MSW Service Worker - must be served without redirects)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon/|public|mockServiceWorker\\.js).*)',
  ],
};
