import { HttpResponse, http, passthrough } from 'msw';
import { isMockEnabled } from '../config';
import { mockUsers } from '../data/users';

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3001';

/**
 * Example user handlers demonstrating MSW patterns.
 *
 * Each handler:
 * 1. Checks if mock is enabled via `isMockEnabled(feature, endpoint)`
 * 2. If disabled, calls `passthrough()` to forward to real API
 * 3. Extracts params/body as needed
 * 4. Returns `HttpResponse.json()` with mock data
 *
 * To add your own handlers, copy this pattern and register them
 * in `src/tests/handlers.ts`.
 */
export const userHandlers = [
  // GET /users - List users with pagination
  http.get(`${BFF_URL}/users`, ({ request }) => {
    if (!isMockEnabled('users', 'getUsers')) {
      return passthrough();
    }

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10);

    const startIndex = (page - 1) * limit;
    const paginatedUsers = mockUsers.slice(startIndex, startIndex + limit);
    const total = mockUsers.length;

    return HttpResponse.json({
      data: {
        users: paginatedUsers,
        pagination: {
          total,
          page,
          limit,
          nextPage: startIndex + limit < total ? page + 1 : null,
        },
      },
      message: 'Users retrieved successfully',
    });
  }),

  // GET /users/:userId - Get user by ID
  http.get(`${BFF_URL}/users/:userId`, ({ params }) => {
    if (!isMockEnabled('users', 'getUserById')) {
      return passthrough();
    }

    const { userId } = params;
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      data: user,
      message: 'User retrieved successfully',
    });
  }),

  // POST /users - Create user
  http.post(`${BFF_URL}/users`, async ({ request }) => {
    if (!isMockEnabled('users', 'createUser')) {
      return passthrough();
    }

    const body = (await request.json()) as Record<string, unknown>;

    const newUser = {
      id: `user-${Date.now()}`,
      name: body.name as string,
      email: body.email as string,
    };

    return HttpResponse.json(
      {
        data: newUser,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  }),

  // PATCH /users/:userId - Update user
  http.patch(`${BFF_URL}/users/:userId`, async ({ params, request }) => {
    if (!isMockEnabled('users', 'updateUser')) {
      return passthrough();
    }

    const { userId } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = { ...user, ...body };

    return HttpResponse.json({
      data: updatedUser,
      message: 'User updated successfully',
    });
  }),

  // DELETE /users/:userId - Delete user
  http.delete(`${BFF_URL}/users/:userId`, ({ params }) => {
    if (!isMockEnabled('users', 'deleteUser')) {
      return passthrough();
    }

    const { userId } = params;
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      message: 'User deleted successfully',
    });
  }),
];
