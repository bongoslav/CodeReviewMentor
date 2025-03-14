'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient, queryClient } from './utils/trpc';

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
} 