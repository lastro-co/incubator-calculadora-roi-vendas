'use client';

import type { ReactNode } from 'react';
import { OfflineOverlay } from '@/components/error/OfflineOverlay';

export function OfflineOverlayProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <OfflineOverlay />
    </>
  );
}
