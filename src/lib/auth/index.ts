// Main auth configuration
export { AuthConfigService } from './auth-config.service';
export type { AuthModeConfig } from './auth-mode.config';
// Auth mode configuration
export {
  AuthMode,
  getAuthConfig,
  getAuthMode,
  isKeycloakEnabled,
} from './auth-mode.config';
export type { AuthError } from './constants';
// Auth constants
export { AUTH_ERRORS, isTokenAuthError } from './constants';
export { KeycloakService } from './keycloak.service';
export { SessionService } from './session.service';
// Individual services
export { TokenService } from './token.service';
// Types
export type {
  KeycloakUserInfo,
  RefreshTokenRequest,
  TokenRefreshResponse,
} from './types';

// Create and export the auth options
import { AuthConfigService } from './auth-config.service';

const authConfigService = new AuthConfigService();
export const authOptions = authConfigService.getAuthOptions();
