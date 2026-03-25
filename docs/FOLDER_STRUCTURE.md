# Folder Structure

```
src/
  app/                       # Next.js App Router (routing, layout, pages)
    api/                     # API routes
      analytics/             #   Analytics proxy endpoint (Amplitude)
        route.ts
      auth/                  #   NextAuth API route
        [...nextauth]/
          route.ts
    auth/                    # Authentication pages
      error/                 #   Auth error page
        page.tsx
      signin/                #   Sign-in page
        page.tsx
    unauthorized/            #   Unauthorized access page
      page.tsx
    error.tsx                # Global error boundary page
    layout.tsx               # Root layout
    loading.tsx              # Global loading UI
    not-found.tsx            # 404 page
    page.tsx                 # Homepage

  components/                # Reusable UI components
    error/                   # Error boundaries and offline overlay
      __tests__/
        OfflineOverlay.test.tsx
      ErrorBoundary.tsx
      OfflineOverlay.tsx
    icons/                   # Icon components
      HelpIcon.tsx
      HomeIcon.tsx
      SettingsIcon.tsx
      Icons.test.tsx
      index.tsx
    layout/                  # Layout components
      Header/
        Header.tsx
        Header.test.tsx
        Header.stories.tsx
        index.ts
    ui/                      # UI primitives (shadcn/ui pattern)
      Icon/
        Icon.tsx
        Icon.test.tsx
        Icon.stories.tsx
        index.ts
      index.ts

  constants/                 # App-wide constants
    api/                     # HTTP methods, status codes, content types
      content-types.ts
      methods.ts
      status-codes.ts
      index.ts
    metadata/                # App metadata (title, description)
      index.ts
    urls.ts                  # URL constants

  features/                  # Feature modules (organized by domain)
    auth/                    # Authentication feature
      components/            #   Auth provider wrapper
        auth-provider-wrapper.tsx
        index.ts
      hooks/                 #   Auth hooks
        use-auth.ts

  lib/                       # Core services and utilities
    __tests__/
      markdown.test.ts

    analytics/               # Multi-provider analytics system
      __tests__/
        consoleLogger.test.ts
        pii-anonymizer.test.ts
      components/
        AnalyticsProvider.tsx
      hooks/
        __tests__/
          useAnalytics.test.tsx
        useAnalytics.ts
      providers/
        __tests__/
          amplitude.test.ts
        amplitude.ts
        proxy.ts
        index.ts
      analytics.config.ts
      analytics.service.ts
      consoleLogger.ts
      endpoints.config.ts
      pii-anonymizer.ts
      types.ts
      index.ts

    auth/                    # Authentication services (SRP)
      auth-config.service.ts       # NextAuth configuration
      auth-mode.config.ts          # Auth mode (Keycloak)
      constants.ts                 # Auth error constants
      keycloak.service.ts          # Keycloak operations
      session.service.ts           # Session management
      token.service.ts             # Token refresh & validation
      token.service.test.ts        # Token service tests
      types.ts                     # Auth types
      index.ts

    config/                  # Configuration files
      socket.ts              # Socket event constants

    fetcher/                 # HTTP client services (SRP)
      auth-token.service.ts        # Bearer token injection
      http-client.service.ts       # Core HTTP client
      retry.service.ts             # Retry with exponential backoff
      timeout.service.ts           # Timeout management
      url-builder.service.ts       # URL construction
      types.ts
      index.ts

    middleware/               # Middleware services (SRP)
      auth-checker.service.ts           # Token validation
      middleware-orchestrator.service.ts # Orchestrator
      redirect.service.ts              # Auth redirects
      route-guard.service.ts           # Protected route detection
      security-headers.service.ts      # CSP, security headers
      types.ts
      index.ts

    security/                # Security utilities
      external-endpoints.config.ts   # Allowed external endpoints (CSP)
      index.ts

    server/                  # Server-side utilities
      auth-check.ts          # Server auth check
      logger-init.ts         # Logger initialization
      user-context.ts        # User context for server

    utils/                   # Utility functions
      error-utils.ts         # Error formatting

    env.ts                   # Environment variables (Zod validated)
    error-handler.ts         # Error handler classes (ApiError, AppError, etc.)
    logger.ts                # Structured logger
    markdown.ts              # Markdown sanitization utilities
    query-keys.ts            # React Query key factories
    react-query-client.ts    # React Query client config
    utils.ts                 # General utilities (cn)

  mocks/                     # MSW mock infrastructure
    data/                    # Mock data
      users.ts               #   Example user data
    handlers/                # MSW request handlers
      user.handlers.ts       #   Example CRUD handlers
      index.ts
    browser.ts               # Browser MSW setup
    config.ts                # Mock feature toggles
    index.ts                 # MSW initialization

  providers/                 # Global React providers
    __tests__/
      AppProviders.test.tsx
    AnalyticsProvider.tsx         # Analytics initialization
    composeProviders.tsx          # Provider composition utility
    DatadogProvider.tsx           # Datadog RUM initialization
    DatadogUserContext.tsx        # Datadog user context
    index.tsx                     # AppProviders (composed)
    MSWProvider.tsx               # Mock Service Worker
    OfflineOverlayProvider.tsx    # Offline indicator
    QueryProvider.tsx             # TanStack React Query
    SessionProvider.tsx           # NextAuth session
    ToasterProvider.tsx           # Sonner toast notifications
    TooltipProvider.tsx           # Radix UI tooltip context

  services/                  # SRP-compliant modular services
    api/                     # API service classes
      auth.service.ts        #   Auth API service (Keycloak userinfo)
      base.service.ts        #   Base service class (get/post/put/patch/delete)
    hooks/                   # React Query hooks by domain
      auth/                  #   useUserInfo, usePermissions
        useUserInfo.ts
        usePermissions.ts
        index.ts
      shared/                #   useApiError
        useApiError.ts
        index.ts
    socket/                  # Socket.io services
      cache.service.ts             # React Query cache updates
      connection.service.ts        # Connection management
      event-handlers.service.ts    # Event handler setup
      reconnection.service.ts      # Reconnection logic
      socket.service.ts            # Main orchestration
      types.ts
      index.ts

  storybook/                 # Storybook configuration
    Welcome.mdx              # Welcome page

  styles/                    # Global styles
    globals.css              # Tailwind CSS + custom theme

  tests/                     # Test utilities
    factories/               # Test data factories (fishery + faker)
      userFactory.ts
    app-test-utils.tsx       # Custom render with all providers
    handlers.ts              # MSW handler registry
    server.ts                # MSW test server

  types/                     # TypeScript type definitions
    images.d.ts              # Image import types
    svg.d.ts                 # SVG import types
```

## Key Principles

- **Co-location**: Tests live near the code they test (e.g., `__tests__/` folders)
- **Domain organization**: Services grouped by business domain
- **Single Responsibility**: Each service has one clear purpose
- **Clear separation**: UI, logic, and data layers are distinct
- **Barrel exports**: `index.ts` files for clean import paths
