# CodeRabbit Guidelines

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome 2.1.1
- **Testing**: Jest 30, Testing Library (React)
- **Mocks**: MSW 2.x
- **Documentation**: Storybook 9
- **Authentication**: NextAuth 4.24, Keycloak
- **Data Fetching**: TanStack React Query 5
- **Analytics**: Amplitude, Datadog RUM

## Tailwind CSS v4

This project uses Tailwind CSS v4 with custom classes defined through CSS variables in `@theme`.

**Important**: Do not suggest removing classes that appear "unused" - they may be valid Tailwind classes defined in the custom theme.

**SVG Handling**: Configured via Turbopack rules to use @svgr/webpack.

## Biome Configuration

The project uses Biome as linter/formatter with custom configuration that:

- Extends the "ultracite" configuration
- **Disables**: `useFilenamingConvention`, `noExplicitAny`, `useAwait`, `noShadow`, `noUnknownAtRule`, `noNamespaceImport`
- **Error**: `useImportType`
- **Off**: Various `complexity`, `nursery` and `performance` rules
- **Globals**: `jest` recognized in test files

Do not suggest changes that conflict with these established configurations.

## TypeScript Configuration

- **Strict mode**: Enabled
- **Target**: ES2017
- **Module**: nodenext
- **Path aliases**:
  - `@/*` -> `src/*`
  - `@/tests/*` -> `src/tests/*`
  - `@/mocks/*` -> `src/mocks/*`

Do not suggest changes to the established path mappings.

## Jest Test Setup

- **Version**: Jest 30
- **Environment**: jsdom
- **Transform**: SWC (@swc/jest)
- **API Mocks**: MSW 2.x configured to intercept requests (`onUnhandledRequest: 'bypass'`)
- **Global Mocks**: ResizeObserver, pointer capture, scrollIntoView (for Radix UI components)
- **Coverage**: Ignores stories, tests, and mocks
- **Path aliases**: Configured and must be respected
- **Factories**: Fishery for test data creation with @faker-js/faker

## Next.js Configuration

- **Turbopack**: Enabled for development
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS (via middleware)
- Do not suggest removal of security headers

## Environment Variables

- **Zod validated**: All env vars validated at startup via `src/lib/env.ts`
- **Client-side inlining**: Each `NEXT_PUBLIC_*` var is explicitly referenced for Next.js build-time replacement
- **Auth**: Keycloak via NextAuth

## Component Structure

- **UI Components**: `src/components/ui/`
- **Stories**: For each component (documentation)
- **Tests**: Unit tests co-located with components
- **Exports**: Organized through `index.ts` barrel files

## Service Architecture

- **SRP**: Each service has a single responsibility
- **Base class**: `BaseApiService` for API services
- **Hooks**: Domain-organized in `src/services/hooks/`
- **Fetcher**: Modular HTTP client in `src/lib/fetcher/`

## Storybook

- **Stories**: Located in `src/**/*.stories.*`
- **TypeScript docgen**: Enabled
- **Static Dir**: `../public`

## pnpm Workspace

**IMPORTANT**: This project is **NOT a monorepo**. The `pnpm-workspace.yaml` is used only to specify dependencies that need build (`onlyBuiltDependencies`).

Do not suggest conversion to monorepo or structural changes.

## Review Guidelines

- `.stories.tsx` files are for documentation/demonstration in Storybook - prioritize functionality and readability over production optimizations
- Respect established configurations in each tool
- Acknowledge that many "conventions" were intentionally disabled in Biome
- Accept custom CSS properties defined in `@theme`
- Recognize the SRP architecture pattern across services
