import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import type { ReactElement, ReactNode } from 'react';
import type { AnalyticsService } from '@/lib/analytics/analytics.service';
import { AnalyticsReactContext } from '@/lib/analytics/hooks/useAnalytics';

// Add other providers as needed

// Mock Analytics Service for tests
const mockAnalyticsService: AnalyticsService = {
  track: jest.fn().mockResolvedValue(undefined),
  identify: jest.fn().mockResolvedValue(undefined),
  page: jest.fn().mockResolvedValue(undefined),
  group: jest.fn().mockResolvedValue(undefined),
  alias: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
  flush: jest.fn().mockResolvedValue(undefined),
  setContext: jest.fn(),
  getContext: jest.fn().mockReturnValue({}),
  clearContext: jest.fn(),
  getProviders: jest.fn().mockReturnValue([{ isEnabled: false }]),
} as any;

// Example of options for render customization
interface Options {
  queryClient?: QueryClient;
}

function ReactQueryWrapper({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient || new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

function render(ui: ReactElement, { queryClient }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    // Add global providers here
    return (
      <SessionProvider session={null}>
        <AnalyticsReactContext.Provider
          value={{ analyticsService: mockAnalyticsService }}
        >
          <ReactQueryWrapper queryClient={queryClient}>
            <TooltipProvider>{children}</TooltipProvider>
          </ReactQueryWrapper>
        </AnalyticsReactContext.Provider>
      </SessionProvider>
    );
  }
  return {
    ...rtlRender(ui, { wrapper: Wrapper }),
  };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { ReactQueryWrapper, render };

// Re-export renderHook from testing-library but with our wrapper
export { renderHook } from '@testing-library/react';
