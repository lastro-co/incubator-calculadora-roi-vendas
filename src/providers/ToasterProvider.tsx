'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

export function ToasterProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
