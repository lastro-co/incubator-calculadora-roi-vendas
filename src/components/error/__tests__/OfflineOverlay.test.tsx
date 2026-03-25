import { act, render, screen, waitFor } from '@testing-library/react';
import { OfflineOverlay } from '../OfflineOverlay';

const CONNECTION_MESSAGE = /Verifique sua conexão e recarregue/i;
const TITLE = 'Sem conexão com internet';

describe('OfflineOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  it('should not render when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    render(<OfflineOverlay />);

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('should render when initially offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflineOverlay />);

    expect(screen.getByText(TITLE)).toBeVisible();
    expect(screen.getByText(CONNECTION_MESSAGE)).toBeVisible();
  });

  it('should show overlay when offline event is triggered', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    render(<OfflineOverlay />);

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(screen.getByText(TITLE)).toBeVisible();
    });
  });

  it('should hide overlay when online event is triggered', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    render(<OfflineOverlay />);

    expect(screen.getByText(TITLE)).toBeVisible();

    // Simulate going back online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<OfflineOverlay />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
  });
});
