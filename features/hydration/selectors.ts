import type { HydrationProgressViewModel } from '@/shared/types/app';

export const getHydrationProgress = (
  consumedMl: number,
  targetMl: number,
): HydrationProgressViewModel => {
  const percentage =
    targetMl > 0 ? Math.round((consumedMl / targetMl) * 100) : 0;
  const overflowMl = Math.max(0, consumedMl - targetMl);
  return {
    consumedMl,
    targetMl,
    percentage: Math.max(0, Math.min(100, percentage)),
    overflowMl,
    isGoalReached: consumedMl >= targetMl,
    hasExceededGoal: overflowMl > 0,
  };
};
