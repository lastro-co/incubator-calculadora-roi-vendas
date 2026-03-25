/**
 * Centralized configuration for analytics service endpoints
 * This ensures consistency across middleware, providers, and security policies
 */

export const ANALYTICS_ENDPOINTS = {
  /**
   * Amplitude Analytics API endpoints
   * Used for event tracking and configuration
   */
  AMPLITUDE: {
    // Main API endpoint for sending events
    API: 'https://api2.amplitude.com',
    // Configuration endpoint for SDK settings
    CONFIG: 'https://sr-client-cfg.amplitude.com',
  },

  /**
   * Other analytics providers can be added here
   * Example: Google Analytics, Mixpanel, etc.
   */
} as const;

/**
 * Get all analytics endpoints as a flat array
 * Useful for CSP configuration and security policies
 */
export function getAllAnalyticsEndpoints(): string[] {
  return [
    ANALYTICS_ENDPOINTS.AMPLITUDE.API,
    ANALYTICS_ENDPOINTS.AMPLITUDE.CONFIG,
  ];
}

/**
 * Get Amplitude-specific endpoints
 */
export function getAmplitudeEndpoints(): string[] {
  return [
    ANALYTICS_ENDPOINTS.AMPLITUDE.API,
    ANALYTICS_ENDPOINTS.AMPLITUDE.CONFIG,
  ];
}
