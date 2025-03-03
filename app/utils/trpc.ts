import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '../server/routers/_app';
import { QueryClient } from '@tanstack/react-query';
import { unstable_httpBatchStreamLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();

export const trpcClient = trpc.createClient({
  links: [
    unstable_httpBatchStreamLink({
      url: `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`,
    }),
  ],
}); 