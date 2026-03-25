/**
 * Authentication mode configuration
 * This template uses Keycloak authentication
 */

export const AuthMode = {
  KEYCLOAK: 'keycloak',
} as const;

export type AuthMode = (typeof AuthMode)[keyof typeof AuthMode];

export interface AuthModeConfig {
  mode: AuthMode;
  keycloak: {
    enabled: boolean;
  };
}

/**
 * Get current authentication mode
 */
export function getAuthMode(): AuthMode {
  return AuthMode.KEYCLOAK;
}

/**
 * Get authentication configuration
 */
export function getAuthConfig(): AuthModeConfig {
  return {
    mode: AuthMode.KEYCLOAK,
    keycloak: {
      enabled: true,
    },
  };
}

/**
 * Check if Keycloak authentication is enabled
 */
export function isKeycloakEnabled(): boolean {
  return true;
}
