# Next.js Starter Template

A production-ready Next.js starter template with **SRP architecture**, Keycloak authentication, multi-provider analytics, real-time socket infrastructure, and a comprehensive testing setup.

> **Package Manager:** This project uses [pnpm](https://pnpm.io/). Install it globally with `npm install -g pnpm`.

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | [Next.js](https://nextjs.org/) (App Router) | 15.x |
| UI | [React](https://react.dev/) | 19.x |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict mode) | 5.x |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 4.x |
| Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | - |
| Data Fetching | [TanStack React Query](https://tanstack.com/query/latest) | 5.x |
| Authentication | [NextAuth](https://next-auth.js.org/) + Keycloak | 4.x |
| Analytics | [Amplitude](https://amplitude.com/) + [Datadog RUM](https://www.datadoghq.com/) | - |
| Real-time | [Socket.io](https://socket.io/) client | 4.x |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | - |
| Testing | [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/) | 30.x |
| Mocking | [MSW](https://mswjs.io/) | 2.x |
| Linting | [Biome](https://biomejs.dev/) (ultracite config) | 2.x |
| Documentation | [Storybook](https://storybook.js.org/) | 9.x |

## Architecture Overview

The project follows a **Single Responsibility Principle (SRP)** architecture where each service has one clear purpose:

```
src/
  app/              # Next.js App Router (pages, layouts, API routes)
  components/       # Reusable UI components (error, icons, layout, ui)
  constants/        # App-wide constants (API, metadata, URLs)
  features/         # Feature modules by domain (auth)
  lib/              # Core services and utilities
    analytics/      #   Multi-provider analytics system
    auth/           #   Keycloak authentication services
    config/         #   Configuration files (socket events)
    fetcher/        #   Modular HTTP client (5 services)
    middleware/     #   Middleware services (5 services)
    security/       #   Security utilities (CSP endpoints)
    server/         #   Server-side utilities
    utils/          #   Error formatting utilities
  mocks/            # MSW mock infrastructure
  providers/        # Global React providers (composed)
  services/         # API services and React Query hooks
    api/            #   Service classes (BaseApiService)
    hooks/          #   Domain-organized query hooks
    socket/         #   Socket.io connection services
  stores/           # State management (placeholder)
  styles/           # Global styles (Tailwind CSS)
  tests/            # Test utilities, factories, MSW server
  types/            # TypeScript type definitions
```

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
For the complete file listing, see [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md).

## Getting Started

### 1. Set up GitHub Packages authentication

This project uses `@lastro-co/design-system` from GitHub Packages, which requires authentication.

**Create a GitHub Personal Access Token (classic):**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Set a name (e.g. `npm-packages-read`) and an expiration
4. Select the scope: `read:packages`
5. Click **Generate token** and copy the value

**Persist the token in your shell:**

```bash
# zsh (default on macOS)
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc && source ~/.zshrc

# bash
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc && source ~/.bashrc

# bash (macOS login shell)
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bash_profile && source ~/.bash_profile
```

```bash
# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Keycloak and API values

# 4. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm type-check` | TypeScript type checking |
| `pnpm lint` | Biome linter check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome format |
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm test:coverage` | Coverage report |
| `pnpm storybook` | Storybook on port 6006 |
| `pnpm build-storybook` | Static Storybook build |

## Key Features

### Authentication (Keycloak)

NextAuth with Keycloak provider, decomposed into 4 SRP services:

- **Auth Config** — NextAuth provider configuration
- **Token Service** — Token refresh & validation with automatic rotation
- **Session Service** — Session lifecycle and Keycloak validation
- **Keycloak Service** — Keycloak-specific operations (logout, config)

```typescript
import { useAuth } from '@/features/auth/hooks/use-auth';

const { isAuthenticated, user, roles, hasRole, login, logout } = useAuth();
```

### HTTP Client (Fetcher)

Modular HTTP client decomposed into 5 specialized services:

- **HTTP Client** — Core orchestrator
- **Retry Service** — Exponential backoff (5xx, 429)
- **Timeout Service** — Request timeout management
- **URL Builder** — URL construction with query params
- **Auth Token** — Automatic Bearer token injection

```typescript
import { BaseApiService } from '@/services/api/base.service';

class MyService extends BaseApiService {
  getItems() { return this.get<Item[]>('/items'); }
  createItem(data: CreateItemDto) { return this.post<Item>('/items', data); }
}
```

### Analytics (Multi-Provider)

Pluggable analytics system with PII anonymization:

- **Amplitude** — User behavior tracking (via server-side proxy)
- **Datadog RUM** — Performance monitoring and error tracking
- **Console Logger** — Development debugging

```typescript
import { useAnalytics } from '@/lib/analytics/hooks/useAnalytics';

const { track, identify, page } = useAnalytics();
track('button_clicked', { buttonId: 'signup' });
```

### Real-time (Socket.io)

Base infrastructure for WebSocket connections:

- **Connection Service** — Lifecycle management
- **Reconnection Service** — Auto-reconnect with exponential backoff
- **Cache Service** — React Query cache invalidation from socket events
- **Event Handlers** — Event listener setup/cleanup

### API Mocking (MSW)

Mock Service Worker for development without a backend:

```bash
# Enable in .env.local
NEXT_PUBLIC_ENABLE_MOCKS=true

# Configure granular toggles in src/mocks/config.ts
```

### Provider Composition

All providers are composed using a utility pattern:

```typescript
// src/providers/index.tsx
composeProviders(
  ErrorBoundary,
  MSWProvider,
  AnalyticsProvider,
  DatadogProvider,
  SessionProvider,
  QueryProvider,
  ToasterProvider,
  TooltipProvider,
  OfflineOverlayProvider,
)
```

## Environment Variables

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the complete environment variables reference.

Key variables:
- `NEXT_PUBLIC_BFF_URL` — Backend API URL
- `KEYCLOAK_*` / `NEXT_PUBLIC_KEYCLOAK_*` — Keycloak configuration
- `NEXT_PUBLIC_DATADOG_*` — Datadog RUM (optional)
- `AMPLITUDE_API_KEY` — Amplitude analytics (optional)
- `NEXT_PUBLIC_ENABLE_MOCKS` — Enable MSW API mocking

## Testing

- **Jest 30** with SWC transform and jsdom environment
- **Testing Library** for React component tests
- **MSW 2.x** for API mocking in tests
- **Fishery + Faker** for test data factories
- **Custom render** with all providers (`src/tests/app-test-utils.tsx`)

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

See [docs/TESTING.md](docs/TESTING.md) for the testing guide.

## Deployment

Optimized for Vercel deployment with Datadog RUM monitoring.

```bash
vercel --prod
```

See [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md) for complete deployment configuration.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | SRP architecture, service decomposition, patterns |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Setup, scripts, environment variables, contributing |
| [FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Complete file and folder listing |
| [TESTING.md](docs/TESTING.md) | Testing strategy, utilities, examples |
| [VERCEL_SETUP.md](docs/VERCEL_SETUP.md) | Vercel + Datadog RUM deployment |
| [SHADCN_ORGANIZATION.md](docs/SHADCN_ORGANIZATION.md) | shadcn/ui component scripts |
| [CODERABBIT_GUIDELINES.md](docs/CODERABBIT_GUIDELINES.md) | AI code review configuration |

---

> **Starter template by Lastro.**
