import { formatDateKeyLabel } from '@/shared/lib/date';
import type {
  HydrationDayState,
  HydrationHistoryListItemViewModel,
  HydrationProgressViewModel,
} from '@/shared/types/app';

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

export const getHydrationHistoryItems = (
  today: HydrationDayState,
  history: HydrationDayState[],
  targetMl: number,
  limit = 7,
): HydrationHistoryListItemViewModel[] =>
  [today, ...history]
    .filter(
      (item, index, collection) =>
        collection.findIndex((entry) => entry.date === item.date) === index,
    )
    .slice(0, limit)
    .map((item) => {
      const progress = getHydrationProgress(item.consumedMl, targetMl);
      return {
        date: item.date,
        label:
          item.date === today.date
            ? 'Today'
            : formatDateKeyLabel(item.date, {
                includeWeekday: true,
              }),
        consumedMl: item.consumedMl,
        targetMl,
        percentage: progress.percentage,
        overflowMl: progress.overflowMl,
        isGoalReached: progress.isGoalReached,
      };
    });
