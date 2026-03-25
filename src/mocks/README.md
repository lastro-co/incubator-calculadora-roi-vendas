# Mock Service Worker (MSW) - Configuration

This directory contains all Mock Service Worker (MSW) configuration for the project.

## What is MSW?

MSW (Mock Service Worker) is a library that intercepts HTTP requests at the network level and returns mocked data. This allows you to develop the interface while waiting for the backend API to be completed.

## File Structure

```
src/mocks/
├── README.md              # This file
├── EXAMPLES.md            # Practical usage scenarios
├── index.ts               # MSW initialization (browser + server)
├── browser.ts             # MSW browser worker setup
├── config.ts              # Configuration for which endpoints to mock
├── data/                  # Mock data
│   └── users.ts           # Example: User mock data (uses test factories)
└── handlers/              # Request handlers
    ├── index.ts           # Barrel export for all handlers
    └── user.handlers.ts   # Example: User CRUD handlers

src/tests/
├── handlers.ts            # Central handler registry (aggregates all handlers)
├── server.ts              # MSW server for Jest tests
└── factories/             # Test data factories (used by mock data)
    └── userFactory.ts     # Example: User factory with Faker
```

## How to Use

### 1. Enable MSW

Add the following variable to your `.env.local` file:

```bash
NEXT_PUBLIC_ENABLE_MOCKS=true
```

### 2. Restart the Server

```bash
pnpm dev
```

### 3. Check the Console

When MSW is active, you will see this message in the browser console:

```
[MSW] Mocking enabled (browser) - API requests will be intercepted
```

## Selective Mock Configuration

You can control which endpoints are mocked and which use the real API through the [config.ts](config.ts) file.

### Mock Only Some Endpoints

Edit `src/mocks/config.ts`:

```typescript
export const mockConfig = {
  users: {
    enabled: true,          // Master switch for users
    getUsers: true,         // Mock — list users
    getUserById: false,     // Real API — get user by ID
    createUser: true,       // Mock — don't pollute dev DB
    updateUser: true,       // Mock
    deleteUser: true,       // Mock
  },

  orders: {
    enabled: false,         // Disables all order mocks
    getOrders: true,        // Ignored because enabled: false
  },
};
```

### Configuration Examples

**1. Mock everything for Users, nothing for Orders:**
```typescript
export const mockConfig = {
  users: { enabled: true },   // All user endpoints mocked
  orders: { enabled: false },  // All order endpoints use real API
};
```

**2. Mock only read operations, write operations use real API:**
```typescript
export const mockConfig = {
  users: {
    enabled: true,
    getUsers: true,         // Mock — GET
    getUserById: true,      // Mock — GET
    createUser: false,      // Real — POST
    updateUser: false,      // Real — PATCH
    deleteUser: false,      // Real — DELETE
  },
};
```

**3. Hybrid development (some endpoints mocked, others real):**
```typescript
export const mockConfig = {
  users: {
    enabled: true,
    getUsers: true,         // Mock — faster for UI testing
    getUserById: false,     // Real — test integration
    createUser: true,       // Mock — don't pollute dev DB
    updateUser: false,      // Real — test form submission
    deleteUser: true,       // Mock — don't delete real data
  },
};
```

### How It Works

When an endpoint is configured as `false` or the feature is disabled (`enabled: false`), MSW uses the `passthrough()` function which lets the request pass to the real backend, as if MSW didn't exist.

## Available Endpoints

### User Endpoints (Example)

- **GET** `/users` - List users with pagination
  - Query params: `page`, `limit`

- **GET** `/users/:userId` - Get user by ID

- **POST** `/users` - Create user
  - Body: `{ name: string, email: string }`

- **PATCH** `/users/:userId` - Update user
  - Body: `{ name?: string, email?: string }`

- **DELETE** `/users/:userId` - Delete user

### API Health Check

- **GET** `/api/health` - Health check endpoint (always available in tests)

## How to Add New Mocks

### 1. Create a Test Factory (optional but recommended)

```typescript
// src/tests/factories/orderFactory.ts
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

interface Order {
  id: string;
  product: string;
  quantity: number;
  total: number;
  createdAt: string;
}

export const orderFactory = Factory.define<Order>(({ sequence }) => ({
  id: `order-${sequence}`,
  product: faker.commerce.productName(),
  quantity: faker.number.int({ min: 1, max: 10 }),
  total: Number.parseFloat(faker.commerce.price()),
  createdAt: faker.date.recent().toISOString(),
}));
```

### 2. Add Mock Data

```typescript
// src/mocks/data/orders.ts
import { orderFactory } from '@/tests/factories/orderFactory';

export const mockOrders = [
  orderFactory.build({ id: 'order-1', product: 'Laptop', total: 2999.99 }),
  orderFactory.build({ id: 'order-2', product: 'Mouse', total: 49.99 }),
  orderFactory.build({ id: 'order-3', product: 'Keyboard', total: 129.99 }),
];
```

### 3. Create Handlers

```typescript
// src/mocks/handlers/order.handlers.ts
import { HttpResponse, http, passthrough } from 'msw';
import { isMockEnabled } from '../config';
import { mockOrders } from '../data/orders';

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3001';

export const orderHandlers = [
  http.get(`${BFF_URL}/orders`, ({ request }) => {
    if (!isMockEnabled('orders', 'getOrders')) {
      return passthrough();
    }

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const limit = Number.parseInt(url.searchParams.get('limit') || '10');

    const startIndex = (page - 1) * limit;
    const paginatedOrders = mockOrders.slice(startIndex, startIndex + limit);

    return HttpResponse.json({
      data: {
        orders: paginatedOrders,
        pagination: {
          total: mockOrders.length,
          page,
          limit,
        },
      },
    });
  }),
];
```

### 4. Register Handlers

Add handlers to the barrel export:

```typescript
// src/mocks/handlers/index.ts
import type { RequestHandler } from 'msw';
import { userHandlers } from './user.handlers';
import { orderHandlers } from './order.handlers';

export const mockHandlers: RequestHandler[] = [
  ...userHandlers,
  ...orderHandlers,
];
```

### 5. Add Config

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: true, /* ... */ },
  orders: {
    enabled: true,
    getOrders: true,
  },
};
```

## Customize Responses

### Simulate Errors

```typescript
http.get(`${BFF_URL}/users/:userId`, ({ params }) => {
  if (!isMockEnabled('users', 'getUserById')) {
    return passthrough();
  }

  // Simulate 404
  if (params.userId === 'not-found') {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Simulate 500
  if (params.userId === 'error') {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  return HttpResponse.json({ data: mockUsers[0] });
});
```

### Simulate Delays

```typescript
import { delay } from 'msw';

http.get(`${BFF_URL}/users`, async () => {
  await delay(2000); // 2 second delay
  return HttpResponse.json({ data: mockUsers });
});
```

### Dynamic Responses

```typescript
http.post(`${BFF_URL}/users`, async ({ request }) => {
  const body = await request.json();

  // Echo back the submitted data with a generated ID
  return HttpResponse.json(
    {
      data: { id: `user-${Date.now()}`, ...body },
      message: 'User created successfully',
    },
    { status: 201 }
  );
});
```

## Disable MSW

To disable MSW and use the real API:

1. Remove or comment out the variable in `.env.local`:
   ```bash
   # NEXT_PUBLIC_ENABLE_MOCKS=true
   ```

2. Or set it to `false`:
   ```bash
   NEXT_PUBLIC_ENABLE_MOCKS=false
   ```

3. Restart the development server

## Tests

MSW is automatically enabled in all tests via `jest.setup.ts`. The test server uses the same handlers defined in `src/tests/handlers.ts`.

```typescript
// jest.setup.ts — already configured
import { server } from '@/tests/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Override Handlers in Tests

You can override specific handlers per test using `server.use()`:

```typescript
import { server } from '@/tests/server';
import { HttpResponse, http } from 'msw';

it('handles server error', async () => {
  server.use(
    http.get('*/users', () => {
      return HttpResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    })
  );

  // ... your test assertions
});
```

## Debugging

### See Intercepted Requests

In the browser console, you will see all requests that MSW is intercepting.

### Handler Not Working

1. Check if `NEXT_PUBLIC_ENABLE_MOCKS=true` in `.env.local`
2. Check if the handler is registered in `src/mocks/handlers/index.ts`
3. Check if the handler URL matches the request URL (including `BFF_URL` prefix)
4. Check the console for MSW error messages
5. Verify the endpoint is enabled in `src/mocks/config.ts`

### Unintercepted Requests

By default, unintercepted requests are allowed (`bypass`). To debug, change in `src/mocks/index.ts`:

```typescript
await worker.start({
  onUnhandledRequest: 'warn', // Warn about unhandled requests
  quiet: false,
});
```

## Additional Resources

- [Official MSW documentation](https://mswjs.io/)
- [Handler examples](https://mswjs.io/docs/basics/response-resolver)
- [Network behavior (delays, errors, etc.)](https://mswjs.io/docs/recipes/network-behavior)
- [EXAMPLES.md](EXAMPLES.md) - Practical usage scenarios for this project
