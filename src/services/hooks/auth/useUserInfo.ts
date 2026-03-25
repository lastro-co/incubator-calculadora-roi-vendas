'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { KeycloakUserInfo } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';
import { authService } from '@/services/api/auth.service';

interface UseUserInfoOptions {
  /** Enable automatic refetching (default: true) */
  enabled?: boolean;
  /** Custom stale time in milliseconds */
  staleTime?: number;
}

/**
 * Hook to fetch and cache user information from Keycloak
 *
 * @example
 * const { data: userInfo, isLoading, error, refetch } = useUserInfo();
 *
 * @example
 * // With custom options
 * const { data: userInfo } = useUserInfo({
 *   enabled: !!session,
 *   staleTime: 1000 * 60 * 10 // 10 minutes
 * });
 */
export function useUserInfo(options: UseUserInfoOptions = {}) {
  const { data: session, status } = useSession();
  const { enabled = true, staleTime } = options;

  // Only executes if the session was loaded and has accessToken
  const isSessionReady = status !== 'loading';
  const hasValidToken = !!session?.accessToken;
  const shouldExecute = enabled && isSessionReady && hasValidToken;

  return useQuery({
    queryKey: queryKeys.auth.userInfo(),
    queryFn: () => {
      if (!session?.accessToken) {
        throw new Error('Token de acesso não disponível');
      }
      return authService.getUserInfo(session.accessToken);
    },
    enabled: shouldExecute,
    staleTime,
    meta: {
      errorMessage: 'Falha ao carregar informações do usuário',
    },
  });
}

/**
 * Type-safe hook return for useUserInfo
 */
export type UseUserInfoReturn = ReturnType<typeof useUserInfo> & {
  data: KeycloakUserInfo | undefined;
};
