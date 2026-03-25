import { type NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import { CONTENT_TYPES, HTTP_METHODS, STATUS_CODES } from '@/constants/api';
import { ANALYTICS_ENDPOINTS } from '@/lib/analytics/endpoints.config';
import {
  type AnonymizedClientInfo,
  applyPIIControls,
} from '@/lib/analytics/pii-anonymizer';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { initializeLoggerContext } from '@/lib/server/logger-init';

export async function GET() {
  // Initialize logger context with agencyId for API route
  initializeLoggerContext();
  return NextResponse.json({
    status: 'healthy',
    timestamp: Date.now(),
  });
}

/**
 * Extract and anonymize client information from request headers
 * PII handling is controlled by ANALYTICS_CAPTURE_PII environment variable:
 * - false (default): Only non-PII data (country, device info)
 * - true: PII collected with anonymization (hashed IP, coarse coordinates)
 */
function extractClientInfo(req: NextRequest): AnonymizedClientInfo {
  const userAgent = req.headers.get('user-agent') || '';
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const clientInfo: AnonymizedClientInfo = {
    library: 'http/2.0',
  };

  // OS information
  if (result.os.name) {
    clientInfo.os_name = result.os.name;
  }
  if (result.os.version) {
    clientInfo.os_version = result.os.version;
  }

  // Device information
  if (result.device.vendor) {
    clientInfo.device_brand = result.device.vendor;
    clientInfo.device_manufacturer = result.device.vendor;
  }
  if (result.device.model) {
    clientInfo.device_model = result.device.model;
  }
  if (result.device.type) {
    clientInfo.device_type = result.device.type;
  } else {
    // Default to desktop if not detected
    clientInfo.device_type = 'desktop';
  }

  // Device family - combine brand and model
  if (result.device.vendor && result.device.model) {
    clientInfo.device_family = `${result.device.vendor} ${result.device.model}`;
  } else if (result.device.vendor) {
    clientInfo.device_family = result.device.vendor;
  }

  // Platform (browser)
  if (result.browser.name) {
    clientInfo.platform = result.browser.name;
  }

  // Language from Accept-Language header
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    const lang = acceptLanguage.split(',')[0];
    clientInfo.language = lang.includes('-') ? lang.split('-')[0] : lang;
  }

  // IP address from headers (common proxy headers)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip');
  if (ip) {
    clientInfo.ip = ip;
  }

  // Cloudflare headers for location data if available
  const cfCountry = req.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') {
    clientInfo.country = cfCountry;
  }

  const cfCity = req.headers.get('cf-ipcity');
  if (cfCity) {
    clientInfo.city = decodeURIComponent(cfCity);
  }

  const cfRegion = req.headers.get('cf-region');
  if (cfRegion) {
    clientInfo.region = cfRegion;
  }

  const cfLatitude = req.headers.get('cf-iplatitude');
  if (cfLatitude) {
    clientInfo.latitude = Number.parseFloat(cfLatitude);
  }

  const cfLongitude = req.headers.get('cf-iplongitude');
  if (cfLongitude) {
    clientInfo.longitude = Number.parseFloat(cfLongitude);
  }

  // Apply PII controls before returning
  // This will remove or anonymize sensitive data based on ANALYTICS_CAPTURE_PII
  return applyPIIControls(clientInfo);
}

export async function POST(req: NextRequest) {
  // Initialize logger context with agencyId for API route
  initializeLoggerContext();

  try {
    const body = await req.json();

    // Basic validation
    if (!body.event_type || typeof body.event_type !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid event_type' },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    // Extract client information from request
    const clientInfo = extractClientInfo(req);

    // Enrich event with client information
    const enrichedEvent = {
      ...body,
      user_properties: {
        ...body.user_properties,
        ...clientInfo,
      },
    };

    // Event validated and ready for processing

    // Forward to Amplitude if API key is available
    if (env.AMPLITUDE_API_KEY) {
      await forwardToAmplitude(enrichedEvent);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Analytics API error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}

async function forwardToAmplitude(eventData: any) {
  try {
    // CRITICAL: Reject events without device_id to prevent MTU inflation
    if (!eventData.device_id) {
      logger.warn('Analytics event rejected: missing device_id', {
        event_type: eventData.event_type,
        has_user_id: !!eventData.user_id,
        session_id: eventData.session_id,
      });
      // Don't forward to Amplitude - this prevents MTU inflation from unstable device IDs
      return;
    }

    const deviceId = eventData.device_id;

    // Allow undefined user_id for anonymous users
    // Amplitude will use device_id as primary identifier when user_id is not present
    const userId = eventData.user_id;

    // Convert session_id to number format required by Amplitude
    let sessionId: number;
    if (eventData.session_id) {
      if (typeof eventData.session_id === 'string') {
        // Extract timestamp from format like "1726531200000-abc123"
        const timestamp = Number.parseInt(
          eventData.session_id.split('-')[0],
          10
        );
        sessionId = Number.isNaN(timestamp) ? Date.now() : timestamp;
      } else {
        sessionId = eventData.session_id;
      }
    } else {
      sessionId = Date.now();
    }

    const amplitudeEvent = {
      api_key: env.AMPLITUDE_API_KEY,
      events: [
        {
          event_type: eventData.event_type,
          user_id: userId,
          device_id: deviceId,
          session_id: sessionId,
          time: eventData.time || Date.now(),
          event_properties: eventData.event_properties || {},
          user_properties: eventData.user_properties || {},
        },
      ],
    };

    const response = await fetch(
      `${ANALYTICS_ENDPOINTS.AMPLITUDE.API}/2/httpapi`,
      {
        method: HTTP_METHODS.POST,
        headers: {
          'Content-Type': CONTENT_TYPES.JSON,
          Accept: '*/*',
        },
        body: JSON.stringify(amplitudeEvent),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Amplitude API error', undefined, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Amplitude API error: ${response.status}`);
    }

    await response.json();
  } catch (error) {
    logger.error('Failed to forward event to Amplitude', error);
    // Don't throw error to prevent breaking the API response
  }
}
