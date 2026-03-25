/**
 * Configuration for which endpoints should be mocked
 *
 * SIMPLE OPTION: Leave everything as `true` and control only via .env.local
 * - NEXT_PUBLIC_ENABLE_MOCKS=true  -> Mocks everything
 * - NEXT_PUBLIC_ENABLE_MOCKS=false -> Uses real API for everything
 *
 * ADVANCED OPTION: Configure granularly for hybrid development
 * - Set as `false` endpoints that should use the real API
 * - Useful when part of the backend is ready
 *
 * Example:
 * ```ts
 * export const mockConfig = {
 *   users: {
 *     enabled: true,
 *     getUsers: true,
 *     getUserById: true,
 *     createUser: false, // Use real API for this endpoint
 *   },
 * } as const;
 * ```
 */
export const mockConfig: Record<string, boolean | Record<string, boolean>> = {
  // Example: User endpoints
  users: {
    enabled: true, // Master switch — false disables all user mocks
    getUsers: true,
    getUserById: true,
    createUser: true,
    updateUser: true,
    deleteUser: true,
  },
};

/**
 * Helper to check if a specific mock is enabled
 */
export function isMockEnabled(feature: string, endpoint?: string): boolean {
  const featureConfig = mockConfig[feature];

  if (featureConfig === undefined) {
    return false;
  }

  if (typeof featureConfig === 'boolean') {
    return featureConfig;
  }

  // If no 'enabled' is defined, assume true
  if (!('enabled' in featureConfig)) {
    return true;
  }

  // If the feature is disabled, return false
  if (!featureConfig.enabled) {
    return false;
  }

  // If no endpoint specified, return the feature status
  if (!endpoint) {
    return featureConfig.enabled;
  }

  // Return the specific endpoint status
  return featureConfig[endpoint] !== false;
}
