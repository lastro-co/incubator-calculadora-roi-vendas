# Development Guide

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```
3. **Run the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Next.js in development mode with Turbopack |
| `build` | Build for production |
| `start` | Start production server |
| `type-check` | Run TypeScript type checking |
| `lint` | Run Biome linter and formatter |
| `lint:fix` | Run Biome with automatic fixes |
| `format` | Format code with Biome |
| `test` | Run all tests with Jest |
| `test:watch` | Run tests in watch mode |
| `test:coverage` | Generate test coverage report |
| `storybook` | Start Storybook locally (http://localhost:6006) |
| `build-storybook` | Build static Storybook |

## Environment Variables

Set in `.env.local` (validated by `src/lib/env.ts` with Zod):

### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BFF_URL` | Base URL for API requests |
| `NEXTAUTH_URL` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | NextAuth secret (min 32 chars) |
| `KEYCLOAK_ID` | Keycloak client ID |
| `KEYCLOAK_SECRET` | Keycloak client secret |
| `KEYCLOAK_ISSUER` | Keycloak issuer URL |

### Client-side Keycloak
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak server URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client ID |

### App Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `Lastro App` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AGENCY_ID` | Multi-tenancy agency ID | — |
| `NEXT_PUBLIC_SOCKET_URL` | General socket URL | `ws://localhost:3001` |
| `NEXT_PUBLIC_CHAT_SOCKET_URL` | Chat WebSocket URL (wss://) | — |
| `NEXT_PUBLIC_ENABLE_MOCKS` | Enable MSW API mocking | `false` |
| `AMPLITUDE_API_KEY` | Amplitude analytics key | — |
| `ANALYTICS_CAPTURE_PII` | Collect PII with anonymization | `false` |

### Datadog RUM (Production)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN` | Datadog client token |
| `NEXT_PUBLIC_DATADOG_APPLICATION_ID` | Datadog application ID |
| `NEXT_PUBLIC_DATADOG_ENV` | Environment name |
| `NEXT_PUBLIC_DATADOG_SITE` | Datadog site |
| `NEXT_PUBLIC_DATADOG_SERVICE` | Service name |
| `NEXT_PUBLIC_DATADOG_VERSION` | App version |

See `.env.example` for full documentation and `docs/VERCEL_SETUP.md` for deployment config.

## Linting & Formatting

- **Biome** for ultra-fast linting and formatting (`biome.jsonc`)
- **Ultracite config** extended for consistent code style
- Run linter:
  ```bash
  pnpm lint      # Check for issues
  pnpm lint:fix  # Auto-fix issues
  pnpm format    # Format code
  ```

### CI/CD Integration

- **GitHub Actions** for CI (`.github/workflows/ci.yml`)
- **Biome CI mode**: `pnpm biome ci .`
- Auto-deployment of Storybook to GitHub Pages

## Storybook

- **Storybook 9** for UI development and documentation
- Custom theming and welcome page (`src/storybook/Welcome.mdx`)
- Start locally:
  ```bash
  pnpm storybook
  ```
- Build static:
  ```bash
  pnpm build-storybook
  ```
- Deploys automatically to GitHub Pages via CI

## Styling

- **Tailwind CSS 4** with native CSS support and custom global styles (`src/styles/globals.css`)
- **PostCSS pipeline** (`postcss.config.mjs`) for CSS processing
- **Security headers** configured in middleware (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS)

## Mock Service Worker (MSW)

For development without a backend or with partial API availability:

1. Set `NEXT_PUBLIC_ENABLE_MOCKS=true` in `.env.local`
2. Restart your dev server
3. Configure granular mock toggles in `src/mocks/config.ts`

See `src/mocks/README.md` for full documentation and `src/mocks/EXAMPLES.md` for practical scenarios.

## CI/CD

- **GitHub Actions** for:
  - Install, lint, and test on PRs
  - Deploy Storybook to GitHub Pages
  - Auto-assign PR authors
- **CODEOWNERS** file for automated code review assignments
- **Pull Request Template** for consistent PR structure

## Contributing

1. Create your branch from `main` or `feature/*`
2. Install dependencies and run the dev server
3. Add or update tests for your changes following the SRP testing strategy
4. Run all checks before pushing:
   ```bash
   pnpm lint && pnpm type-check && pnpm test
   ```
5. Ensure your services follow Single Responsibility Principle
6. Open a Pull Request with a clear description
7. Follow the established patterns for component organization and testing
