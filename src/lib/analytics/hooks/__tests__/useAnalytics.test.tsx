import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AnalyticsContextProvider } from '../../components/AnalyticsProvider';
import { useAnalytics } from '../useAnalytics';

const mockService = {
  track: jest.fn(),
  getProviders: jest.fn().mockReturnValue([{ isEnabled: true }]),
} as any;

const wrapper = ({ children }: { children: ReactNode }) => (
  <AnalyticsContextProvider analyticsService={mockService}>
    {children}
  </AnalyticsContextProvider>
);

describe('useAnalytics', () => {
  it('should call track method', async () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    await result.current.track('test_event');
    expect(mockService.track).toHaveBeenCalledWith('test_event', undefined);
  });
});
