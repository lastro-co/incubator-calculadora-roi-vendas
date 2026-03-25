import { logger } from '@/lib/logger';
import type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsProvider,
} from './types';

export class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private context: AnalyticsContext = {};
  private eventBuffer: AnalyticsEvent[] = [];
  private config: Required<AnalyticsConfig>;
  private ready: Promise<void>;

  constructor(config: AnalyticsConfig) {
    this.config = {
      providers: config.providers || [],
      enabledInDevelopment: config.enabledInDevelopment ?? false,
      enableConsoleLogging: config.enableConsoleLogging ?? false,
      bufferEvents: config.bufferEvents ?? false,
      bufferSize: config.bufferSize ?? 100,
    };

    this.providers = this.config.providers.filter((_provider) => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      return isDevelopment ? this.config.enabledInDevelopment : true;
    });

    logger.debug('Analytics service initialized', {
      providers: this.providers.map((p) => p.name),
      enabled_in_development: this.config.enabledInDevelopment,
    });

    // Initialize providers and store readiness promise
    this.ready = this.initializeProviders();
  }

  private async initializeProviders(): Promise<void> {
    if (!this.shouldTrack()) {
      return;
    }

    const promises = this.providers
      .filter((provider) => provider.isEnabled && provider.initialize)
      .map(async (provider) => {
        try {
          logger.debug('Initializing analytics provider', {
            name: provider.name,
          });
          await provider.initialize?.();
        } catch (error) {
          logger.error('Failed to initialize analytics provider', error, {
            name: provider.name,
          });
        }
      });

    await Promise.allSettled(promises);
  }

  private shouldTrack(): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? this.config.enabledInDevelopment : true;
  }

  private enrichEvent(
    name: AnalyticsEventName,
    properties?: Record<string, any>
  ): AnalyticsEvent {
    return {
      name,
      properties: {
        ...this.context.properties,
        ...properties,
      },
      userId: this.context.userId || 'developer_preview',
      sessionId: this.context.sessionId,
      timestamp: new Date(),
    };
  }

  private async executeOnProviders<T extends keyof AnalyticsProvider>(
    method: T,
    ...args: any[]
  ): Promise<void> {
    if (!this.shouldTrack()) {
      return;
    }

    const promises = this.providers
      .filter((provider) => provider.isEnabled && provider[method])
      .map(async (provider) => {
        try {
          const methodFn = provider[method] as Function;
          await methodFn.apply(provider, args);
        } catch (error) {
          logger.error('Analytics provider error', error);
        }
      });

    await Promise.allSettled(promises);
  }

  setContext(context: Partial<AnalyticsContext>): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): AnalyticsContext {
    return { ...this.context };
  }

  clearContext(): void {
    this.context = {};
  }

  async track(
    name: AnalyticsEventName,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.ready;
    const event = this.enrichEvent(name, properties);

    if (this.config.enableConsoleLogging) {
      logger.debug('Analytics event dispatched', {
        event_name: event.name,
        properties: event.properties,
        user_id: event.userId,
        session_id: event.sessionId,
        provider_count: this.providers.filter((p) => p.isEnabled).length,
      });
    }

    if (this.config.bufferEvents) {
      this.eventBuffer.push(event);
      if (this.eventBuffer.length > this.config.bufferSize) {
        this.eventBuffer.shift();
      }
    }

    await this.executeOnProviders('track', event);
  }

  async identify(
    userId: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.ready;
    this.setContext({
      userId,
      properties: { ...this.context.properties, ...properties },
    });
    await this.executeOnProviders('identify', userId, properties);
  }

  async page(name: string, properties?: Record<string, any>): Promise<void> {
    await this.ready;
    await this.executeOnProviders('page', name, properties);
  }

  async group(
    groupId: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.ready;
    await this.executeOnProviders('group', groupId, properties);
  }

  async alias(newId: string, previousId?: string): Promise<void> {
    await this.ready;
    await this.executeOnProviders('alias', newId, previousId);
  }

  async reset(): Promise<void> {
    await this.ready;
    this.clearContext();
    await this.executeOnProviders('reset');
  }

  async flush(): Promise<void> {
    await this.ready;
    await this.executeOnProviders('flush');
    this.eventBuffer = [];
  }

  getEventBuffer(): readonly AnalyticsEvent[] {
    return [...this.eventBuffer];
  }

  getProviders(): readonly AnalyticsProvider[] {
    return [...this.providers];
  }

  async addProvider(provider: AnalyticsProvider): Promise<void> {
    // Initialize provider if needed
    if (this.shouldTrack() && provider.isEnabled && provider.initialize) {
      try {
        await provider.initialize();
      } catch (error) {
        logger.error('Failed to initialize runtime provider', error, {
          name: provider.name,
        });
        return;
      }
    }

    const existingIndex = this.providers.findIndex(
      (p) => p.name === provider.name
    );
    if (existingIndex >= 0) {
      this.providers[existingIndex] = provider;
    } else {
      this.providers.push(provider);
    }
  }

  removeProvider(providerName: string): void {
    this.providers = this.providers.filter((p) => p.name !== providerName);
  }
}
