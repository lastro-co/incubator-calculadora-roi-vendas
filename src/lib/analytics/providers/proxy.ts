import { logger } from '@/lib/logger';
import { formatErrorForLog } from '@/lib/utils/error-utils';
import type { AnalyticsEvent, AnalyticsProvider } from '../types';

const SESSION_STORAGE_KEY = 'analytics_session_id' as const;
const DEVICE_ID_STORAGE_KEY = 'analytics_device_id' as const;
const LAST_ACTIVITY_KEY = 'analytics_last_activity' as const;
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const MAX_QUEUE_SIZE = 200;
const POST_TIMEOUT_MS = 4000;

/**
 * Analytics provider that uses our server-side proxy
 * This keeps the API keys secure on the server
 */
export class AnalyticsProxyProvider implements AnalyticsProvider {
  readonly name = 'proxy';
  readonly isEnabled = true;

  private sessionId: string;
  private deviceId: string;
  private userId: string | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private queue: Array<() => Promise<void>> = [];

  constructor() {
    // Session per browser session: persisted in sessionStorage when available
    this.sessionId = this.loadOrCreateSessionId();
    // Device ID persisted in localStorage for consistent user identification
    this.deviceId = this.loadOrCreateDeviceId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private loadOrCreateSessionId(): string {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        const lastActivity = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);

        if (existing && lastActivity) {
          const timeSinceLastActivity =
            Date.now() - Number.parseInt(lastActivity, 10);
          if (timeSinceLastActivity < SESSION_TTL_MS) {
            // Session still valid - update timestamp
            window.sessionStorage.setItem(
              LAST_ACTIVITY_KEY,
              Date.now().toString()
            );
            return existing;
          }
          // Session expired, will create new one below
        }

        // Create new session
        const sid = this.generateSessionId();
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
        window.sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        return sid;
      }
    } catch {
      // Ignore storage errors
    }
    return this.generateSessionId();
  }

  private loadOrCreateDeviceId(): string {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (existing) {
          return existing;
        }
        const did = this.generateDeviceId();
        window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, did);
        return did;
      }
    } catch {
      // Ignore storage errors (private browsing, etc)
    }
    return this.generateDeviceId();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    // Skip initialization during server-side rendering or build time
    if (typeof window === 'undefined') {
      logger.info('Skipping analytics proxy initialization during SSR/build');
      return;
    }

    this.initPromise = (async () => {
      try {
        // Test connection to our analytics proxy
        const response = await fetch('/api/analytics', {
          method: 'GET',
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`Analytics proxy not available: ${response.status}`);
        }

        this.isInitialized = true;
        await this.flushQueue();
      } catch (error) {
        // Analytics initialization failure is non-critical
        // App continues to function normally without analytics
        logger.warn('Failed to initialize analytics proxy', {
          error: formatErrorForLog(error),
        });
        this.initPromise = null;
        // Don't throw - allow the app to continue without analytics
      }
    })();

    return this.initPromise;
  }

  private collectBrowserInfo(): Record<string, any> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {};
    }

    const browserInfo: Record<string, any> = {};

    // Language
    if (navigator.language) {
      browserInfo.language = navigator.language.split('-')[0];
    }

    // Platform
    if (navigator.platform) {
      browserInfo.platform = navigator.platform;
    }

    // User Agent
    if (navigator.userAgent) {
      browserInfo.user_agent = navigator.userAgent;
    }

    // Screen resolution
    if (window.screen) {
      browserInfo.screen_width = window.screen.width;
      browserInfo.screen_height = window.screen.height;
    }

    // Viewport size
    if (window.innerWidth && window.innerHeight) {
      browserInfo.viewport_width = window.innerWidth;
      browserInfo.viewport_height = window.innerHeight;
    }

    // Device pixel ratio
    if (window.devicePixelRatio) {
      browserInfo.device_pixel_ratio = window.devicePixelRatio;
    }

    // Timezone
    try {
      browserInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      // Ignore if not available
    }

    // Connection type (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        if (connection.effectiveType) {
          browserInfo.connection_type = connection.effectiveType;
        }
        if (connection.downlink) {
          browserInfo.connection_downlink = connection.downlink;
        }
      }
    }

    // Device memory (if available)
    if ('deviceMemory' in navigator) {
      browserInfo.device_memory = (navigator as any).deviceMemory;
    }

    // Hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency) {
      browserInfo.cpu_cores = navigator.hardwareConcurrency;
    }

    return browserInfo;
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.isInitialized) {
      if (!this.initPromise) {
        // Auto-init on first call
        void this.initialize().catch(() => {
          // Auto-init failed, but we still queue the event
        });
      }
      const safeEvent =
        typeof structuredClone === 'function'
          ? structuredClone(event)
          : {
              ...event,
              properties: event.properties
                ? { ...event.properties }
                : undefined,
            };
      if (this.queue.length >= MAX_QUEUE_SIZE) {
        this.queue.shift();
      }
      this.queue.push(() => this.track(safeEvent));
      return;
    }

    // Collect browser information
    const browserInfo = this.collectBrowserInfo();

    let sessionId = event.sessionId || this.sessionId;

    // Revalidate TTL before using current session (when no explicit session_id)
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const lastActivity = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);
        if (!event.sessionId && lastActivity) {
          const timeSinceLastActivity =
            Date.now() - Number.parseInt(lastActivity, 10);
          if (timeSinceLastActivity >= SESSION_TTL_MS) {
            // Session expired - create new session
            this.sessionId = this.generateSessionId();
            window.sessionStorage.setItem(SESSION_STORAGE_KEY, this.sessionId);
            sessionId = this.sessionId;
          }
        }
        // Update last activity timestamp to keep session alive
        window.sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      }
    } catch {
      // Ignore storage errors
    }

    const analyticsEvent = {
      event_type: event.name,
      user_id: event.userId || this.userId || undefined,
      device_id: this.deviceId,
      session_id: sessionId,
      time: event.timestamp ? event.timestamp.getTime() : Date.now(),
      event_properties: event.properties || {},
      user_properties: browserInfo,
    };

    await this.sendEventWithRetry(analyticsEvent);
  }

  async page(name: string, properties?: Record<string, any>): Promise<void> {
    await this.track({
      name: 'page_view',
      properties: {
        page: name,
        ...properties,
      },
    });
  }

  async identify(
    userId: string,
    properties?: Record<string, any>
  ): Promise<void> {
    if (!this.isInitialized) {
      // Keep intended userId and schedule identify
      this.userId = userId;
      if (!this.initPromise) {
        void this.initialize().catch(() => {
          // Auto-init failed, but we still queue the event
        });
      }
      const safeProps =
        typeof structuredClone === 'function'
          ? structuredClone(properties ?? {})
          : { ...(properties ?? {}) };
      if (this.queue.length >= MAX_QUEUE_SIZE) {
        this.queue.shift();
      }
      this.queue.push(() => this.identify(userId, safeProps));
      return;
    }

    this.userId = userId;

    let sessionId = this.sessionId;

    // Revalidate TTL before using current session
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const lastActivity = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivity) {
          const timeSinceLastActivity =
            Date.now() - Number.parseInt(lastActivity, 10);
          if (timeSinceLastActivity >= SESSION_TTL_MS) {
            // Session expired - create new session
            this.sessionId = this.generateSessionId();
            window.sessionStorage.setItem(SESSION_STORAGE_KEY, this.sessionId);
            sessionId = this.sessionId;
          }
        }
        // Update last activity timestamp to keep session alive
        window.sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      }
    } catch {
      // Ignore storage errors
    }

    const event = {
      event_type: '$identify',
      user_id: userId,
      device_id: this.deviceId,
      session_id: sessionId,
      time: Date.now(),
      user_properties: properties || {},
    };

    await this.sendEventWithRetry(event);
  }

  async flush(): Promise<void> {
    // No buffering in proxy implementation
    // Events are sent immediately
    // But we need to ensure initialization is complete
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async flushQueue(): Promise<void> {
    const queuedEvents = [...this.queue];
    this.queue = [];

    // Process all queued events in parallel
    await Promise.allSettled(
      queuedEvents.map(async (fn) => {
        try {
          await fn();
        } catch (error) {
          // Log queue flush errors as WARN since analytics is non-critical
          logger.warn('Failed to flush queued analytics event', {
            error: formatErrorForLog(error),
          });
        }
      })
    );
  }

  private async sendEventWithRetry(
    event: Record<string, any>,
    attempt = 1
  ): Promise<void> {
    // Skip sending events during server-side rendering or build time
    if (typeof window === 'undefined') {
      logger.debug('Skipping analytics event during SSR/build', {
        event_type: event.event_type,
      });
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), POST_TIMEOUT_MS);
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        // Allows delivery during page unload
        keepalive: true,
        body: JSON.stringify(event),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        // Do not retry on 4xx (except 429)
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Analytics request retryable: ${response.status}`);
        }
        // Non-retryable errors (4xx) are logged as WARN since analytics is non-critical
        logger.warn('Analytics event rejected by server', {
          status: response.status,
          event_type: event.event_type,
        });
        return;
      }
    } catch (error) {
      if (attempt < MAX_RETRY_ATTEMPTS) {
        // Exponential backoff with jitter: ~1s, ~2s, ~4s
        const delay = Math.floor(
          RETRY_DELAY_MS * 2 ** (attempt - 1) * (0.85 + Math.random() * 0.3)
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.sendEventWithRetry(event, attempt + 1);
      }

      // Analytics failures are non-critical and should not break user experience
      // Common causes: network issues, timeouts, page navigation, CORS
      // Log as WARN since this is expected behavior in many scenarios
      logger.warn(
        'Analytics event failed after all retries - continuing without tracking',
        {
          event_type: event.event_type,
          attempts: attempt,
          error: formatErrorForLog(error),
        }
      );
    }
  }
}
