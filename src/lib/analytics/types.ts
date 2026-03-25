export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface AnalyticsProvider {
  name: string;
  isEnabled: boolean;
  initialize?(): Promise<void> | void;
  track(event: AnalyticsEvent): Promise<void> | void;
  identify?(
    userId: string,
    properties?: Record<string, any>
  ): Promise<void> | void;
  page?(name: string, properties?: Record<string, any>): Promise<void> | void;
  group?(
    groupId: string,
    properties?: Record<string, any>
  ): Promise<void> | void;
  alias?(newId: string, previousId?: string): Promise<void> | void;
  reset?(): Promise<void> | void;
  flush?(): Promise<void> | void;
}

export interface AnalyticsConfig {
  providers: AnalyticsProvider[];
  enabledInDevelopment?: boolean;
  enableConsoleLogging?: boolean;
  bufferEvents?: boolean;
  bufferSize?: number;
}

export interface AnalyticsContext {
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

export type AnalyticsEventName =
  | 'page_view'
  | 'button_click'
  | 'button_clicked'
  | 'form_submit'
  | 'user_login'
  | 'user_logout'
  | 'user_signup'
  | 'error_occurred'
  | 'feature_used'
  | string; // Allow custom event names

// Standard analytics properties based on your business needs
export interface StandardAnalyticsProperties {
  // Business context
  agencyId?: string;
  userId?: string;
  isInternal?: boolean;

  // Page/Location context
  page?: string;
  section?: string;

  // Action context
  action?: string;
  actionType?: string;

  // UI Element context
  buttonId?: string;
  elementId?: string;
  elementType?: string;

  // Additional metadata
  timestamp?: string;
  sessionId?: string;
  version?: string;
  environment?: string;
}
