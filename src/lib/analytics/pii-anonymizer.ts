import { createHash } from 'node:crypto';
import { env } from '@/lib/env';

/**
 * PII Anonymization Utilities for Analytics
 *
 * These utilities help comply with GDPR/LGPD by anonymizing or removing
 * personally identifiable information (PII) from analytics data.
 *
 * Environment Variable:
 * - ANALYTICS_CAPTURE_PII: Controls PII collection (default: false)
 *   - "false" or undefined: Only country-level data (non-PII)
 *   - "true": Collect PII with anonymization (hashed IP, coarse location)
 */

/**
 * Hash an IP address using SHA-256
 * This makes the IP non-reversible while maintaining consistency for analytics
 *
 * @param ip - IP address to hash (IPv4 or IPv6)
 * @returns SHA-256 hash of the IP
 */
export function anonymizeIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Quantize coordinates to a coarse grid (~10km precision)
 * This provides general location without exact positioning
 *
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Quantized coordinates with ~10km precision
 */
export function anonymizeCoordinates(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } {
  // Round to 1 decimal place (~10km precision)
  // 0.1 degree ≈ 11km at equator
  return {
    latitude: Math.round(latitude * 10) / 10,
    longitude: Math.round(longitude * 10) / 10,
  };
}

/**
 * Check if PII capture is enabled via environment variable
 * Default: false (only non-PII data collected)
 *
 * @returns true if ANALYTICS_CAPTURE_PII is explicitly set to "true"
 */
export function isPIICaptureEnabled(): boolean {
  return env.ANALYTICS_CAPTURE_PII;
}

/**
 * Type for client info with optional PII fields
 */
export interface AnonymizedClientInfo {
  library: string;
  platform?: string;
  os_name?: string;
  os_version?: string;
  device_brand?: string;
  device_manufacturer?: string;
  device_model?: string;
  device_type?: string;
  device_family?: string;
  carrier?: string;
  country?: string;
  // PII fields (only included if ANALYTICS_CAPTURE_PII=true)
  region?: string;
  city?: string;
  dma?: string;
  language?: string;
  ip?: string; // Will be hashed if included
  latitude?: number; // Will be quantized if included
  longitude?: number; // Will be quantized if included
}

/**
 * Apply PII controls to client information
 * - If PII capture disabled: Remove IP, city, region, coordinates
 * - If PII capture enabled: Anonymize IP (hash) and coordinates (quantize)
 *
 * @param clientInfo - Raw client information
 * @returns Anonymized client information based on PII settings
 */
export function applyPIIControls(
  clientInfo: AnonymizedClientInfo
): AnonymizedClientInfo {
  const piiEnabled = isPIICaptureEnabled();

  if (!piiEnabled) {
    // Remove all PII fields, keep only country (non-PII)
    // biome-ignore lint/correctness/noUnusedVariables: Destructuring to remove PII fields
    const { ip, city, region, latitude, longitude, ...nonPII } = clientInfo;
    return nonPII;
  }

  // PII enabled: anonymize sensitive data
  const anonymized = { ...clientInfo };

  // Hash IP if present
  if (anonymized.ip) {
    anonymized.ip = anonymizeIP(anonymized.ip);
  }

  // Quantize coordinates if present
  if (
    typeof anonymized.latitude === 'number' &&
    typeof anonymized.longitude === 'number'
  ) {
    const coords = anonymizeCoordinates(
      anonymized.latitude,
      anonymized.longitude
    );
    anonymized.latitude = coords.latitude;
    anonymized.longitude = coords.longitude;
  }

  return anonymized;
}
