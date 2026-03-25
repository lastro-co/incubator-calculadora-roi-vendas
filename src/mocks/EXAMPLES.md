# Practical MSW Usage Examples

This document contains practical examples of how to configure MSW for different development scenarios.

## Scenario 1: Backend Doesn't Exist Yet

**Situation:** The API is still under development and you need to develop the frontend.

**Configuration:**

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: true },   // All endpoints mocked
  orders: { enabled: true },  // All endpoints mocked
};
```

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MOCKS=true
```

**Result:** All requests are intercepted and return mocked data. You can build the entire UI without a backend.

---

## Scenario 2: Backend Partially Ready

**Situation:** Some API endpoints are ready, others are not.

**Example:** User listing is ready, but order management is not.

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: false },   // Uses real API
  orders: { enabled: true },   // Uses mocks
};
```

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MOCKS=true
NEXT_PUBLIC_BFF_URL=https://api-dev.example.com
```

**Result:**
- User requests go to `https://api-dev.example.com`
- Order requests are mocked

---

## Scenario 3: Test Edge Cases

**Situation:** API is ready, but you want to test specific scenarios (errors, delays, empty states).

**Configuration:**

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: {
    enabled: true,
    getUsers: false,       // Uses real API
    getUserById: true,     // Mock to simulate specific user states
    createUser: false,     // Uses real API
    updateUser: true,      // Mock to test optimistic updates
    deleteUser: true,      // Mock to avoid deleting real data
  },
};
```

Edit mock data to simulate the scenario:

```typescript
// src/mocks/data/users.ts
import { userFactory } from '@/tests/factories/userFactory';

export const mockUsers = [
  userFactory.build({
    id: 'user-edge-case',
    name: '', // Empty name — test validation UI
    email: 'invalid-email', // Invalid format
  }),
];
```

---

## Scenario 4: Offline Development

**Situation:** Working in an environment without API access (airplane, VPN issues, etc.).

**Configuration:**

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: true },
  orders: { enabled: true },
  // Enable all features
};
```

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MOCKS=true
```

**Result:** Application works completely offline.

---

## Scenario 5: E2E Tests with Controlled Data

**Situation:** Running automated tests that need consistent, deterministic data.

**Configuration:**

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: true },
  orders: { enabled: true },
};
```

Use factories with fixed seeds or explicit values:

```typescript
// src/mocks/data/users.ts
import { userFactory } from '@/tests/factories/userFactory';

export const mockUsers = [
  userFactory.build({ id: 'user-1', name: 'Test User A', email: 'a@test.com' }),
  userFactory.build({ id: 'user-2', name: 'Test User B', email: 'b@test.com' }),
];
```

**Result:** Tests always receive the same mocked data regardless of backend state.

---

## Scenario 6: Protect Production Data

**Situation:** Don't want to accidentally modify production data during development.

**Configuration:**

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: {
    enabled: true,
    getUsers: false,       // Read real data
    getUserById: false,    // Read real data
    createUser: true,      // Mock — don't create real users
    updateUser: true,      // Mock — don't modify real users
    deleteUser: true,      // Mock — don't delete real users
  },
};
```

**Result:** You can see real data, but all write operations are safely mocked.

---

## Scenario 7: Performance Testing

**Situation:** Test how the UI behaves with lots of data (pagination, infinite scroll, large lists).

**1. Generate large datasets:**

```typescript
// src/mocks/data/users.ts
import { userFactory } from '@/tests/factories/userFactory';

// Generate 500 users for performance testing
export const mockUsers = userFactory.buildList(500);
```

**2. Configure:**

```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: true },
};
```

**Result:** Test pagination, virtual scrolling, and list performance with 500 users.

---

## Scenario 8: Simulate API Errors

**Situation:** Test how the application handles different error states.

**Edit the handler to return errors for specific IDs:**

```typescript
// src/mocks/handlers/user.handlers.ts
http.get(`${BFF_URL}/users/:userId`, ({ params }) => {
  if (!isMockEnabled('users', 'getUserById')) {
    return passthrough();
  }

  const { userId } = params;

  // Simulate 404
  if (userId === 'not-found') {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Simulate 500
  if (userId === 'error-500') {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  // Simulate timeout
  if (userId === 'slow') {
    return delay(30000).then(() =>
      HttpResponse.json({ error: 'Request Timeout' }, { status: 408 })
    );
  }

  // Normal response
  const user = mockUsers.find((u) => u.id === userId);
  return HttpResponse.json({ data: user });
});
```

---

## Scenario 9: Team Development

**Situation:** Team working on different features that depend on different APIs.

**Developer 1 (working on Users):**
```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: false },   // Uses real API being developed
  orders: { enabled: true },   // Uses mock
};
```

**Developer 2 (working on Orders):**
```typescript
// src/mocks/config.ts
export const mockConfig = {
  users: { enabled: true },    // Uses mock
  orders: { enabled: false },  // Uses real API being developed
};
```

**Result:** Each developer focuses on their area without depending on others' work.

---

## Scenario 10: Production (Mocks Disabled)

**Situation:** Production build.

```bash
# .env.production or without the variable
NEXT_PUBLIC_ENABLE_MOCKS=false
```

**Result:** MSW completely disabled, all requests go to the real API. Zero overhead.

---

## Tips

1. **Always use `.env.local` for development** — never commit this file
2. **Document special configurations** in code when simulating edge cases
3. **Keep mock data realistic** — use test factories with Faker for realistic data
4. **Use the browser console** to see which requests are being mocked
5. **Test with mocks disabled** before merging to ensure compatibility with real API
6. **Use `server.use()` in tests** to override handlers for specific test cases
7. **Use `userFactory.buildList(n)`** to quickly generate large datasets for stress testing
