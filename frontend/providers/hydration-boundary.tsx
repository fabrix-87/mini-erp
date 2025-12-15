
'use client';

import { HydrationBoundary as RQHydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface HydrationBoundaryProps {
  children: ReactNode;
  state: any;
}

export function HydrationBoundary({ children, state }: HydrationBoundaryProps) {
  return (
    <RQHydrationBoundary state={state}>
      {children}
    </RQHydrationBoundary>
  );
}
