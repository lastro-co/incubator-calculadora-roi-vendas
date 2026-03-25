'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { isTokenAuthError } from '@/lib/auth';
import { usePermissions, useUserInfo } from '@/services/hooks/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  session: any;
  accessToken?: string;
  roles?: string[];
  error?: string;
}

interface AuthActions {
  login: (redirectTo?: string) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  inGroup: (group: string) => boolean;
  inAnyGroup: (groups: string[]) => boolean;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Authentication hook with integrated permissions and user info
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const { data: userInfo } = useUserInfo();
  const { hasRole, hasAnyRole, hasAllRoles, inGroup, inAnyGroup, roles } =
    usePermissions();

  const login = useCallback(async (redirectTo?: string) => {
    await signIn('keycloak', {
      callbackUrl: redirectTo || '/',
    });
  }, []);

  const logout = useCallback(async (redirectTo?: string) => {
    await signOut({
      callbackUrl: redirectTo || '/',
    });
  }, []);

  // Auto-handle token expiration
  useEffect(() => {
    if (isTokenAuthError(session?.error)) {
      logout('/auth/signin');
    }
  }, [session?.error, logout]);

  return {
    isAuthenticated: status === 'authenticated' && !session?.error,
    isLoading: status === 'loading',
    user: userInfo || session?.user || null,
    session,
    accessToken: session?.accessToken,
    roles,
    error: session?.error,

    login,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    inGroup,
    inAnyGroup,
  };
}
