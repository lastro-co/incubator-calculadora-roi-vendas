'use client';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AnalyticsProvider } from './AnalyticsProvider';
import { composeProviders } from './composeProviders';
import { DatadogProvider } from './DatadogProvider';
import { MSWProvider } from './MSWProvider';
import { OfflineOverlayProvider } from './OfflineOverlayProvider';
import { QueryProvider } from './QueryProvider';
import { SessionProvider } from './SessionProvider';
import { ToasterProvider } from './ToasterProvider';
import { TooltipProvider } from './TooltipProvider';

export const AppProviders = composeProviders(
  ErrorBoundary, // Most outer provider
  MSWProvider, // Initialize MSW early to intercept all requests
  AnalyticsProvider,
  DatadogProvider,
  SessionProvider,
  QueryProvider,
  ToasterProvider,
  TooltipProvider, // Global tooltip provider
  OfflineOverlayProvider // Most inner provider
);
