/**
 * Centralized configuration for external service endpoints
 * Used in CSP policies, security headers, and service integrations
 */

/**
 * Datadog RUM (Real User Monitoring) endpoints
 * Maps Datadog site configurations to their intake endpoints
 */
export const DATADOG_ENDPOINTS = {
  /**
   * Script source for Datadog browser agent
   */
  SCRIPT_SRC: 'https://www.datadoghq-browser-agent.com',

  /**
   * Intake endpoints by region/site
   * Used for sending RUM data to Datadog
   */
  INTAKE_ENDPOINTS: {
    'datadoghq.com': 'https://browser-intake-datadoghq.com', // US1
    'us3.datadoghq.com': 'https://browser-intake-us3-datadoghq.com', // US3
    'us5.datadoghq.com': 'https://browser-intake-us5-datadoghq.com', // US5
    'datadoghq.eu': 'https://browser-intake-datadoghq.eu', // EU1
    'ap1.datadoghq.com': 'https://browser-intake-ap1-datadoghq.com', // AP1
    'ddog-gov.com': 'https://browser-intake-ddog-gov.com', // GOV
  },
} as const;

/**
 * Google services endpoints
 */
export const GOOGLE_ENDPOINTS = {
  /**
   * Google Fonts API for font definitions
   */
  FONTS_API: 'https://fonts.googleapis.com',

  /**
   * Google Fonts static resources
   */
  FONTS_STATIC: 'https://fonts.gstatic.com',
} as const;

/**
 * Development endpoints
 */
export const DEVELOPMENT_ENDPOINTS = {
  /**
   * Local development server URLs
   */
  LOCALHOST_3000: 'http://localhost:3000',
  LOCALHOST_3001: 'http://localhost:3001',
} as const;

/**
 * Get Datadog intake endpoints for a specific site
 */
export function getDatadogIntakeEndpoints(site?: string): string[] {
  if (!site) {
    return [];
  }

  const endpoint =
    DATADOG_ENDPOINTS.INTAKE_ENDPOINTS[
      site as keyof typeof DATADOG_ENDPOINTS.INTAKE_ENDPOINTS
    ];
  return endpoint ? [endpoint] : [];
}

/**
 * Get all Google service endpoints
 */
export function getGoogleEndpoints(): string[] {
  return [GOOGLE_ENDPOINTS.FONTS_API, GOOGLE_ENDPOINTS.FONTS_STATIC];
}

/**
 * Get all Datadog endpoints (script + intake)
 */
export function getDatadogEndpoints(site?: string): {
  scriptSrc: string[];
  connectSrc: string[];
} {
  return {
    scriptSrc: [DATADOG_ENDPOINTS.SCRIPT_SRC],
    connectSrc: getDatadogIntakeEndpoints(site),
  };
}

/**
 * Get development endpoints based on environment
 */
export function getDevelopmentEndpoints(isDev: boolean): string[] {
  if (!isDev) {
    return [];
  }

  return [DEVELOPMENT_ENDPOINTS.LOCALHOST_3001];
}
