import { ConsoleAnalyticsProvider } from '../consoleLogger';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn() },
}));

const { logger } = require('@/lib/logger');

describe('ConsoleAnalyticsProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should log events', () => {
    const provider = new ConsoleAnalyticsProvider(true);
    provider.track({ name: 'test_event', properties: { foo: 'bar' } });
    expect(logger.debug).toHaveBeenCalledWith(
      'Analytics Event',
      expect.any(Object)
    );
  });

  it('should not log when disabled', () => {
    const provider = new ConsoleAnalyticsProvider(false);
    provider.track({ name: 'test_event', properties: {} });
    expect(logger.debug).not.toHaveBeenCalled();
  });
});
