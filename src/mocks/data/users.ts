import { userFactory } from '@/tests/factories/userFactory';

/**
 * Mock users data
 *
 * Uses the test factory to generate realistic data.
 * You can customize individual entries or generate arrays for performance testing.
 *
 * @example
 * // Generate 100 users for pagination testing
 * export const mockUsers = userFactory.buildList(100);
 */
export const mockUsers = [
  userFactory.build({
    id: 'user-1',
    name: 'Maria Silva',
    email: 'maria@example.com',
  }),
  userFactory.build({
    id: 'user-2',
    name: 'João Santos',
    email: 'joao@example.com',
  }),
  userFactory.build({
    id: 'user-3',
    name: 'Ana Oliveira',
    email: 'ana@example.com',
  }),
];
