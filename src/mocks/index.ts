/**
 * Mock Service Worker (MSW) initialization
 *
 * This module provides a centralized way to enable/disable API mocking.
 * When enabled, MSW intercepts all HTTP requests and returns mock responses
 * defined in the handlers.
 *
 * Usage:
 * - Set NEXT_PUBLIC_ENABLE_MOCKS=true in .env.local to enable mocking
 * - The mock server will automatically start in development mode
 * - In tests, MSW is always enabled via jest.setup.ts
 */

let workerInstance: unknown = null;

export async function initMocks() {
  // Check if mocking is enabled via environment variable
  const enableMocks = process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true';

  if (!enableMocks) {
    return;
  }

  // Browser environment - use Service Worker
  if (typeof window !== 'undefined') {
    // @ts-expect-error - Dynamic import path resolution differs between dev and build
    const { logger } = await import('@/lib/logger');
    // @ts-expect-error - Dynamic import path resolution differs between dev and build
    const { worker } = await import('./browser');

    // Store worker instance to prevent multiple registrations
    if (workerInstance) {
      logger.info('[MSW] Worker already started, skipping initialization');
      return workerInstance;
    }

    // Start the worker with quiet mode to reduce console noise
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
      quiet: false, // Set to true to reduce console output
      serviceWorker: {
        // Specify service worker URL to ensure it's correctly registered
        url: '/mockServiceWorker.js',
      },
    });

    // Ensure Service Worker is fully active and controlling the page before allowing requests.
    // worker.start() resolves when registered, but the SW may not be "active" yet on refresh.
    if (navigator.serviceWorker) {
      await navigator.serviceWorker.ready;
    }

    workerInstance = worker;

    logger.info(
      '[MSW] Mocking enabled (browser) - API requests will be intercepted'
    );

    // Monitor Service Worker lifecycle
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('[MSW] Service Worker controller changed');
      });

      // Check if Service Worker is active
      navigator.serviceWorker.ready.then((registration) => {
        logger.info('[MSW] Service Worker is ready and active');

        // Monitor for updates
        registration.addEventListener('updatefound', () => {
          logger.info('[MSW] Service Worker update found');
        });
      });
    }

    return worker;
  }

  // Server environment (Next.js SSR) - use Node server
  // Only run in development to avoid production builds failing
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import to avoid Next.js bundling msw/node for the client
    const msw = await import('msw/node');
    // @ts-expect-error - Dynamic import path resolution differs between dev and build
    const handlersModule = await import('@/tests/handlers');

    const server = msw.setupServer(
      ...(handlersModule.handlers as Parameters<typeof msw.setupServer>)
    );

    // Start the server for Node.js environment
    server.listen({
      onUnhandledRequest: 'bypass',
    });

    // Use console.log directly on server to avoid env validation issues during instrumentation
    // biome-ignore lint/suspicious/noConsole: MSW server initialization logging
    console.log(
      '[MSW] Mocking enabled (server) - API requests will be intercepted'
    );
  }
}
