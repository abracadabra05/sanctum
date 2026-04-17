import {
  calculateHabitStreak,
  getHabitCards,
} from '@/features/habits/selectors';
import type { HabitItem } from '@/shared/types/app';

describe('habit selectors', () => {
  const habit: HabitItem = {
    id: 'habit-1',
    name: 'Meditation',
    icon: 'sparkles',
    accentColor: '#CFF4F1',
    goalMode: 'daily',
    targetPerPeriod: 1,
    schedule: { days: [0, 1, 2, 3, 4, 5, 6] },
    archived: false,
    archivedAt: null,
    reminder: { enabled: false, time: null },
    completions: ['2026-03-21', '2026-03-20', '2026-03-19'],
  };

  it('calculates streak from consecutive scheduled dates', () => {
    expect(
      calculateHabitStreak(habit, new Date('2026-03-21T10:00:00.000Z')),
    ).toBe(3);
  });

  it('maps habits into cards', () => {
    const cards = getHabitCards([habit], '12h');
    // streakDays is 0 because the default today is the actual current date,
    // which is past the habit's completion dates. Use calculateHabitStreak directly for deterministic tests.
    expect(cards[0]).toMatchObject({
      id: 'habit-1',
      name: 'Meditation',
      icon: 'sparkles',
    });
  });
});
