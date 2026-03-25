# Architecture Guide

## Single Responsibility Principle (SRP) Architecture

The project follows a strict **SRP architecture** with modular services. Each service has one clear purpose, making the codebase easy to understand, test, and extend.

### Service Decomposition

- **Authentication Services** (4 focused services) — Token management, session validation, Keycloak operations, configuration
- **HTTP Client Services** (5 components) — Core client, retry logic, timeout management, URL builder, auth token injection
- **Middleware Services** (5 specialized services) — Route guards, security headers, auth checker, redirects, orchestration
- **Socket Services** (6 base services) — Connection, reconnection, cache, event handlers, orchestration, types
- **Analytics Services** (4 providers) — Multi-provider system, Amplitude, Datadog, console logger

---

## Data Fetching & Caching

- **TanStack Query** for server state, caching, and background updates
- **Optimistic updates** with automatic rollback on errors
- **Background refetch** with exponential backoff retry logic
- Global provider configuration in `src/lib/react-query-client.ts`
- Centralized query keys in `src/lib/query-keys.ts`
- Domain-organized hooks in `src/services/hooks/` (auth, shared)

### Hooks Architecture

```typescript
// Authentication hooks
import { useUserInfo, usePermissions } from '@/services/hooks/auth';

// Error handling with STATUS_CODES integration
import { useApiError } from '@/services/hooks/shared';

// Analytics
import { useAnalytics } from '@/lib/analytics/hooks/useAnalytics';

// Auth state
import { useAuth } from '@/features/auth/hooks/use-auth';
```

### Query Keys Factory

Query keys follow a factory pattern for type-safe cache management:

```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    userInfo: () => ['auth', 'userInfo'] as const,
    permissions: () => ['auth', 'permissions'] as const,
    roles: () => ['auth', 'roles'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: (userId: string) => ['user', 'profile', userId] as const,
    preferences: () => ['user', 'preferences'] as const,
  },
  // Add your domain-specific keys here:
  // example: {
  //   all: ['example'] as const,
  //   list: (filters: Filters) => ['example', 'list', filters] as const,
  //   detail: (id: string) => ['example', 'detail', id] as const,
  // },
} as const;
```

---

## API Integration

### Modular HTTP Client Architecture

The HTTP client is decomposed into 5 specialized services:

| Service | Responsibility |
|---------|---------------|
| `http-client.service.ts` | Core HTTP client orchestrating all services |
| `retry.service.ts` | Retry with exponential backoff (5xx, 429) |
| `timeout.service.ts` | Request timeout management |
| `url-builder.service.ts` | URL construction with query params |
| `auth-token.service.ts` | Bearer token injection from session |
| `types.ts` | Shared TypeScript types |

### Service-Based API Classes

```typescript
// Base service class with typed HTTP methods
class BaseApiService {
  protected get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  protected post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>;
  protected put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>;
  protected patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>;
  protected delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}

// Example: Creating a new API service
class ExampleService extends BaseApiService {
  getItems(): Promise<Item[]> {
    return this.get('/items');
  }

  getItem(id: string): Promise<Item> {
    return this.get(`/items/${id}`);
  }

  createItem(data: CreateItemDto): Promise<Item> {
    return this.post('/items', data);
  }
}

export const exampleService = new ExampleService();
```

---

## Authentication

### Keycloak Integration

Authentication uses NextAuth with Keycloak provider, decomposed into 4 services:

1. **Auth Config Service** (`auth-config.service.ts`) — NextAuth provider configuration
2. **Token Service** (`token.service.ts`) — Token refresh & validation with automatic rotation
3. **Session Service** (`session.service.ts`) — Session lifecycle and validation against Keycloak
4. **Keycloak Service** (`keycloak.service.ts`) — Keycloak-specific operations (logout, config)

### Auth Flow

```
User Request -> Middleware (route guard) -> Token Check -> Keycloak Validation -> Page Render
                    |                           |
                    v                           v
              Public routes bypass        Token refresh if expired
```

### Auth Hooks

```typescript
import { useAuth } from '@/features/auth/hooks/use-auth';

const {
  isAuthenticated,
  isLoading,
  user,
  roles,
  accessToken,
  login,
  logout,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  inGroup,
  inAnyGroup,
} = useAuth();
```

---

## Middleware Architecture

The middleware is decomposed into 5 specialized services:

| Service | Responsibility |
|---------|---------------|
| `route-guard.service.ts` | Determine if route is protected |
| `auth-checker.service.ts` | Validate authentication token |
| `security-headers.service.ts` | CSP, HSTS, X-Frame-Options, Referrer-Policy |
| `redirect.service.ts` | Auth redirect handling |
| `middleware-orchestrator.service.ts` | Orchestrates all services |

The root `src/middleware.ts` delegates to the orchestrator, keeping the entry point minimal.

---

## Analytics Architecture

Multi-provider analytics system with pluggable providers:

```
AnalyticsService (orchestrator)
  |-- AmplitudeProvider (user behavior tracking)
  |-- DatadogProvider (RUM performance monitoring)
  |-- ConsoleLoggerProvider (development debugging)
```

- Server-side proxy at `/api/analytics` for Amplitude events
- PII anonymization for GDPR/LGPD compliance
- Configurable via `ANALYTICS_CAPTURE_PII` env var

### Usage

```typescript
import { useAnalytics } from '@/lib/analytics/hooks/useAnalytics';

const { track, identify, page, group, reset } = useAnalytics();

// Track events
track('feature_used', { featureName: 'dashboard' });

// Identify users
identify(userId, { plan: 'pro' });
```

---

## Socket.io Base Architecture

Infrastructure for real-time features via Socket.io:

| Service | Responsibility |
|---------|---------------|
| `connection.service.ts` | WebSocket connection lifecycle |
| `reconnection.service.ts` | Auto-reconnect with exponential backoff |
| `cache.service.ts` | React Query cache invalidation from events |
| `event-handlers.service.ts` | Event listener setup/cleanup |
| `socket.service.ts` | Main orchestration service |

### Extending with Domain Events

To add real-time features, extend the event handlers and cache services:

```typescript
// 1. Add events to src/lib/config/socket.ts
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  // Add your domain events:
  // MESSAGE_NEW: 'message:new',
  // NOTIFICATION: 'notification',
} as const;

// 2. Extend SocketEventHandlersService
private setupMessageHandlers(socket: Socket): void {
  socket.on(SOCKET_EVENTS.MESSAGE_NEW, (data) => {
    this.cacheService.handleNewMessage(data.message, data.chatId);
  });
}

// 3. Extend SocketCacheService
handleNewMessage(message: Message, chatId: string): void {
  this.queryClient.setQueryData(
    queryKeys.chat.messagesInfinite(chatId),
    (old) => { /* update cache */ }
  );
}
```

---

## Provider Composition

Providers are composed using the `composeProviders` utility:

```typescript
// src/providers/index.tsx
export const AppProviders = composeProviders(
  ErrorBoundary,         // Outermost — catches rendering errors
  MSWProvider,           // Initialize MSW early to intercept requests
  AnalyticsProvider,     // Analytics context
  DatadogProvider,       // Datadog RUM initialization
  SessionProvider,       // NextAuth session
  QueryProvider,         // TanStack React Query
  ToasterProvider,       // Sonner toast notifications
  TooltipProvider,       // Radix UI tooltip context
  OfflineOverlayProvider // Innermost — offline indicator
);
```

---

## Key Principles

- **Single Responsibility**: Each service has one clear purpose
- **Domain Organization**: Services grouped by business domain
- **Co-location**: Tests live near the code they test
- **Clear Separation**: UI, logic, and data layers are distinct
- **Composition over Inheritance**: Providers and services composed, not deeply nested
- **Barrel Exports**: `index.ts` files for clean import paths
