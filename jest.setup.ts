import { server } from '@/tests/server';
import '@testing-library/jest-dom';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });

// Mock next-auth to avoid jose ESM issues
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Stub pointer capture and scrollIntoView for Radix UI (Select, etc.) in JSDOM
Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

// Mock window.location to avoid JSDOM navigation errors
delete (window as any).location;
window.location = {
  href: 'http://localhost',
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  toString: jest.fn(() => 'http://localhost'),
} as any;

// Suppress JSDOM navigation errors
const originalConsoleError = console.error;

console.error = (...args: unknown[]) => {
  const message = args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg && typeof arg === 'object' && 'message' in arg)
        return (arg as { message: string }).message;
      return String(arg);
    })
    .join(' ');

  // Suppress "Not implemented" errors from JSDOM (navigation, etc.)
  if (message.includes('Not implemented')) {
    return;
  }

  originalConsoleError.apply(
    console,
    args as Parameters<typeof console.error>
  );
};

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
