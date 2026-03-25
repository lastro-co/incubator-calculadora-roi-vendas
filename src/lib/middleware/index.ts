import type { NextRequest } from 'next/server';

// Main orchestrator service

export { AuthenticationCheckerService } from './auth-checker.service';
export { MiddlewareOrchestratorService } from './middleware-orchestrator.service';
export { RedirectService } from './redirect.service';
// Individual services for advanced usage
export { RouteGuardService } from './route-guard.service';
export { SecurityHeadersService } from './security-headers.service';

// Types
export type {
  MiddlewareContext,
  MiddlewareHandler,
  RouteConfig,
  SecurityHeaders,
} from './types';

// Create and export the main middleware function
import { MiddlewareOrchestratorService } from './middleware-orchestrator.service';

const middlewareOrchestrator = new MiddlewareOrchestratorService();

export async function processMiddleware(req: NextRequest) {
  return middlewareOrchestrator.processRequest(req);
}
