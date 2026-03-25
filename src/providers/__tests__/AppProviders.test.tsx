import { render, screen } from '@testing-library/react';
import { AppProviders } from '../index';

// Mock all providers to focus on the structure
jest.mock('../AnalyticsProvider', () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="analytics-provider">{children}</div>
  ),
}));

jest.mock('../DatadogProvider', () => ({
  DatadogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="datadog-provider">{children}</div>
  ),
}));

jest.mock('../SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

jest.mock('../QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

jest.mock('../ToasterProvider', () => ({
  ToasterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toaster-provider">{children}</div>
  ),
}));

jest.mock('../OfflineOverlayProvider', () => ({
  OfflineOverlayProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="offline-overlay-provider">{children}</div>
  ),
}));

// Mock ErrorBoundary to avoid react-error-boundary module issues
jest.mock('@/components/error/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

jest.mock('../MSWProvider', () => ({
  MSWProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="msw-provider">{children}</div>
  ),
}));

describe('AppProviders', () => {
  it('should render all providers in correct order', () => {
    render(
      <AppProviders>
        <div data-testid="test-content">Test Content</div>
      </AppProviders>
    );

    // Check if ErrorBoundary is wrapping everything
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Check if all providers are rendered
    expect(screen.getByTestId('analytics-provider')).toBeInTheDocument();
    expect(screen.getByTestId('datadog-provider')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster-provider')).toBeInTheDocument();
    expect(screen.getByTestId('offline-overlay-provider')).toBeInTheDocument();

    // Check if test content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should maintain provider hierarchy', () => {
    render(
      <AppProviders>
        <div data-testid="test-content">Test Content</div>
      </AppProviders>
    );

    // ErrorBoundary should be the outermost wrapper
    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toBeInTheDocument();

    // DatadogProvider should be inside ErrorBoundary
    expect(errorBoundary).toContainElement(
      screen.getByTestId('datadog-provider')
    );
  });
});
