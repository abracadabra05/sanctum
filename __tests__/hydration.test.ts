import { getHydrationProgress } from '@/features/hydration/selectors';

describe('hydration selectors', () => {
  it('returns rounded progress percentage', () => {
    expect(getHydrationProgress(1800, 2500)).toEqual({
      consumedMl: 1800,
      targetMl: 2500,
      percentage: 72,
      overflowMl: 0,
      isGoalReached: false,
      hasExceededGoal: false,
    });
  });

  it('caps progress at 100 percent', () => {
    const progress = getHydrationProgress(2600, 2500);
    expect(progress.percentage).toBe(100);
    expect(progress.overflowMl).toBe(100);
    expect(progress.hasExceededGoal).toBe(true);
  });
});
