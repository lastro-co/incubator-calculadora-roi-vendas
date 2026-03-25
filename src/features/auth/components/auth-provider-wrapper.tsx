'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

/**
 * Authentication provider wrapper using NextAuth SessionProvider
 */
export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

/**
 * Main authentication provider
 */
export function AuthProvider({ children }: AuthProviderWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
