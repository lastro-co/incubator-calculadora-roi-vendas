# Testing Guide

## Testing Strategy

This project implements a robust testing strategy following the **Single Responsibility Principle (SRP)**:

### Test Structure

- **Co-located tests** in `__tests__/` folders near services
- **SRP compliance** validated architecturally
- **Component tests** with Storybook integration
- **Service-focused testing** with comprehensive coverage

### Testing Framework

- **Jest 30** for running tests (`jest.config.ts`)
- **@testing-library/react** for React component tests
- **MSW 2.x** for API mocking (`src/tests/server.ts`, `src/tests/handlers.ts`)
- **Factories** for test data with [fishery](https://github.com/thoughtbot/fishery) and [@faker-js/faker](https://fakerjs.dev/)
- **jsdom** environment for browser-like testing
- **SWC** transform for fast compilation

### Test Files

```bash
# Component Tests
src/components/icons/Icons.test.tsx                        # Icon rendering
src/components/error/__tests__/OfflineOverlay.test.tsx     # Error UI
src/components/layout/Header/Header.test.tsx               # Layout components
src/components/ui/Icon/Icon.test.tsx                       # UI components

# Service Tests
src/lib/auth/token.service.test.ts                         # Token refresh & validation

# Analytics Tests
src/lib/analytics/__tests__/consoleLogger.test.ts          # Console provider
src/lib/analytics/__tests__/pii-anonymizer.test.ts         # PII anonymization
src/lib/analytics/providers/__tests__/amplitude.test.ts    # Amplitude
src/lib/analytics/hooks/__tests__/useAnalytics.test.tsx    # Analytics hook

# Utility Tests
src/lib/__tests__/markdown.test.ts                         # Markdown utilities

# Provider Tests
src/providers/__tests__/AppProviders.test.tsx               # Provider composition
```

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage

# Type checking
pnpm type-check
```

## Test Utilities

### Custom Render with Providers

Tests use `app-test-utils.tsx` which wraps components with all necessary providers:

```typescript
import { render, screen } from '@/tests/app-test-utils';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

This render function includes: `SessionProvider`, `AnalyticsContext`, `QueryClientProvider`, `TooltipProvider`.

### Test Factories

Use fishery + faker to generate test data:

```typescript
// src/tests/factories/userFactory.ts
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

export const userFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
}));

// Usage in tests
const user = userFactory.build({ name: 'Custom Name' });
const users = userFactory.buildList(5);
```

### MSW Handlers

Mock API responses for tests:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/server';

it('should handle API error', async () => {
  server.use(
    http.get('/api/example', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    })
  );
  // ... test error handling
});
```

## Jest Setup

The `jest.setup.ts` includes critical JSDOM polyfills:

- **next-auth mock** — Avoids jose ESM issues
- **ResizeObserver mock** — For Radix UI components
- **Pointer capture stubs** — For Radix UI (Select, etc.)
- **scrollIntoView stub** — JSDOM doesn't implement natively
- **window.location mock** — Avoids JSDOM navigation errors
- **Console error suppression** — Filters "Not implemented" JSDOM errors
- **MSW server** with `onUnhandledRequest: 'bypass'`

## Quality Assurance

- **Isolated testing** — Each service tested independently
- **Mocking strategy** — External dependencies only
- **Edge case coverage** — Comprehensive error scenarios
- **Factory pattern** — Consistent test data generation
