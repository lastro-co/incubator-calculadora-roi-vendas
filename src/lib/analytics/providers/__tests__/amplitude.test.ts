import { AmplitudeAnalyticsProvider } from '../amplitude';

jest.mock('@amplitude/analytics-browser', () => ({
  init: jest.fn(),
  track: jest.fn(),
}));
jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

const { init, track } = require('@amplitude/analytics-browser');

describe('AmplitudeAnalyticsProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should initialize with API key', () => {
    new AmplitudeAnalyticsProvider(true, 'test-key');
    expect(init).toHaveBeenCalledWith('test-key', expect.any(Object));
  });

  it('should track events', () => {
    const provider = new AmplitudeAnalyticsProvider(true, 'test-key');
    provider.track({ name: 'test_event', properties: { foo: 'bar' } });
    expect(track).toHaveBeenCalledWith('test_event', { foo: 'bar' });
  });
});
