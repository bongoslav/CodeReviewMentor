import { router } from '../trpc';
import { submissionsRouter } from './submissions';
import { aiRouter } from './ai';

export const appRouter = router({
  submissions: submissionsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter; 