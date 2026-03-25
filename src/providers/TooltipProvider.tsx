'use client';

import { Provider as TooltipProviderPrimitive } from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

interface TooltipProviderProps {
  children: ReactNode;
}

/**
 * Global TooltipProvider
 *
 * This provider should be placed at the root level of the application to avoid
 * creating multiple nested providers for each Tooltip instance.
 *
 * Benefits:
 * - Better performance by having a single provider context
 * - Consistent tooltip behavior across the application
 * - Proper implementation of React Context pattern
 */
export function TooltipProvider({ children }: TooltipProviderProps) {
  return (
    <TooltipProviderPrimitive delayDuration={200} skipDelayDuration={0}>
      {children}
    </TooltipProviderPrimitive>
  );
}
