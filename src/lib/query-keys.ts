/**
 * Centralized query keys for consistent cache management and invalidation.
 *
 * @example
 * // Usage in hooks
 * const { data } = useQuery({
 *   queryKey: queryKeys.auth.userInfo(),
 *   queryFn: () => authService.getUserInfo()
 * });
 *
 * // Invalidate specific cache
 * queryClient.invalidateQueries({ queryKey: queryKeys.auth.userInfo() });
 *
 * // Invalidate all auth queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
 *
 * // Add your own domain keys following the same pattern:
 * // domain: {
 * //   all: ['domain'] as const,
 * //   list: (filters?: Record<string, unknown>) => ['domain', 'list', filters] as const,
 * //   detail: (id: string) => ['domain', 'detail', id] as const,
 * // },
 */
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
} as const;
