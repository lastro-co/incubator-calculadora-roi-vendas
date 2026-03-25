'use client';

import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/features/auth/components/auth-provider-wrapper';

export function SessionProvider({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
