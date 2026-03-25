import * as amplitude from '@amplitude/analytics-browser';
import { logger } from '@/lib/logger';
import type { AnalyticsEvent, AnalyticsProvider } from '../types';

const AUTOCAPTURE_CONFIG = {
  pageViews: false,
  sessions: false,
  formInteractions: false,
  fileDownloads: false,
} as const;

export class AmplitudeAnalyticsProvider implements AnalyticsProvider {
  name = 'amplitude';
  isEnabled: boolean;
  private initialized = false;

  constructor(isEnabled = true, apiKey?: string) {
    logger.debug('AmplitudeAnalyticsProvider constructor', {
      isEnabled,
      apiKey: apiKey ? `${apiKey.slice(0, 8)}...` : 'undefined',
      windowExists: typeof window !== 'undefined',
    });

    this.isEnabled = isEnabled && typeof window !== 'undefined';

    // Initialize Amplitude if API key is provided and we're in browser
    if (this.isEnabled && apiKey) {
      try {
        logger.debug('Initializing Amplitude with API key');

        amplitude.init(apiKey, {
          autocapture: AUTOCAPTURE_CONFIG,
        });
        this.initialized = true;

        logger.info('Amplitude initialized successfully');
      } catch (error) {
        logger.error('Amplitude initialization failed', error);
        this.isEnabled = false;
      }
    } else {
      logger.debug('Amplitude not initialized', {
        enabled: this.isEnabled,
        hasApiKey: !!apiKey,
      });
    }
  }

  track(event: AnalyticsEvent): void {
    logger.debug('AmplitudeAnalyticsProvider.track called', {
      enabled: this.isEnabled,
      initialized: this.initialized,
      eventName: event.name,
      properties: event.properties,
    });

    if (!this.isEnabled || !this.initialized) {
      logger.debug('Amplitude provider not enabled or not initialized');
      return;
    }

    try {
      const properties: Record<string, any> = {
        ...event.properties,
      };

      // Add metadata
      if (event.userId) {
        properties.user_id = event.userId;
        // Set the userId in Amplitude SDK
        amplitude.setUserId(event.userId);
      }

      if (event.sessionId) {
        properties.session_id = event.sessionId;
      }

      if (event.timestamp) {
        properties.timestamp = event.timestamp.toISOString();
      }

      logger.debug('Sending event to Amplitude', {
        eventName: event.name,
        propertiesCount: Object.keys(properties).length,
      });

      amplitude.track(event.name, properties);

      logger.debug('Amplitude track completed', { eventName: event.name });
    } catch (error) {
      logger.error('Amplitude track failed', error, { eventName: event.name });
      // Silent fail - analytics shouldn't break the app
    }
  }

  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.isEnabled || !this.initialized) {
      return;
    }

    // Validate userId - avoid very short or obviously invalid values
    if (!userId || userId.length < 3) {
      return;
    }

    try {
      const identify = new amplitude.Identify();

      if (properties) {
        Object.entries(properties).forEach(([key, value]) => {
          identify.set(key, value);
        });
      }

      // Set the userId in the SDK and send the Identify
      amplitude.setUserId(userId);
      amplitude.identify(identify);
    } catch (_error) {
      // Silent fail
    }
  }

  page(name: string, properties?: Record<string, any>): void {
    if (!this.isEnabled || !this.initialized) {
      return;
    }

    try {
      amplitude.track('Page Viewed', {
        page_name: name,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        page_path:
          typeof window !== 'undefined' ? window.location.pathname : '',
        ...properties,
      });
    } catch (_error) {
      // Silent fail
    }
  }

  group(groupId: string, properties?: Record<string, any>): void {
    if (!this.isEnabled || !this.initialized) {
      return;
    }

    try {
      amplitude.setGroup('company', groupId);

      if (properties) {
        // Track group identification event
        amplitude.track('Group Identified', {
          group_id: groupId,
          group_type: 'company',
          ...properties,
        });
      }
    } catch (_error) {
      // Silent fail
    }
  }

  alias(newId: string, previousId?: string): void {
    if (!this.isEnabled || !this.initialized) {
      return;
    }

    try {
      // Amplitude SDK doesn't have direct alias method like Mixpanel
      // We can track an alias event instead
      amplitude.track('User Alias', {
        new_id: newId,
        previous_id: previousId,
      });
    } catch (_error) {
      // Silent fail
    }
  }

  reset(): void {
    if (!this.isEnabled || !this.initialized) {
      return;
    }

    try {
      amplitude.reset();
    } catch (_error) {
      // Silent fail
    }
  }

  flush(): void {
    if (!this.isEnabled || !this.initialized) {
      return;
    }

    try {
      amplitude.flush();
    } catch (_error) {
      // Silent fail
    }
  }
}
