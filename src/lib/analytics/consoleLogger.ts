import { logger } from '@/lib/logger';
import type { AnalyticsEvent, AnalyticsProvider } from './types';

/**
 * Console/Debug analytics provider - for development and debugging
 * Uses the structured logger for consistent formatting
 */
export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  name = 'console';
  isEnabled: boolean;

  constructor(isEnabled = true) {
    this.isEnabled = isEnabled;
  }

  track(event: AnalyticsEvent): void {
    if (!this.isEnabled) {
      return;
    }

    logger.debug('Analytics Event', {
      event_name: event.name,
      properties: event.properties,
      user_id: event.userId,
      session_id: event.sessionId,
      timestamp: event.timestamp || new Date(),
      provider: this.name,
    });
  }

  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      return;
    }

    logger.info('User Identified', {
      user_id: userId,
      properties,
      provider: this.name,
    });
  }

  page(name: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      return;
    }

    logger.debug('Page View', {
      page_name: name,
      properties,
      provider: this.name,
    });
  }

  group(groupId: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      return;
    }

    logger.debug('Group Event', {
      group_id: groupId,
      properties,
      provider: this.name,
    });
  }

  alias(newId: string, previousId?: string): void {
    if (!this.isEnabled) {
      return;
    }

    logger.debug('User Alias', {
      new_id: newId,
      previous_id: previousId,
      provider: this.name,
    });
  }

  reset(): void {
    if (!this.isEnabled) {
      return;
    }

    logger.debug('User Reset', {
      provider: this.name,
    });
  }

  flush(): void {
    if (!this.isEnabled) {
      return;
    }

    logger.debug('Events Flushed', {
      provider: this.name,
    });
  }
}
