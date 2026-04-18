import { resetAppState } from '@/shared/storage/adapter';
import { createSeedState } from '@/shared/storage/seed';
import { useAppStore } from '@/shared/store/app-store';

jest.mock('@/shared/storage/adapter', () => ({
  importAppStatePayload: jest.fn(),
  loadAppState: jest.fn(),
  resetAppState: jest.fn().mockResolvedValue(undefined),
  saveAppState: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/services/notifications', () => ({
  requestNotificationPermissions: jest.fn().mockResolvedValue(false),
  syncHabitNotifications: jest.fn().mockResolvedValue(undefined),
  syncWaterNotifications: jest.fn().mockResolvedValue(undefined),
}));

describe('app store resetAllData', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const seedState = createSeedState();
    useAppStore.setState((state) => ({
      ...state,
      ...seedState,
      hydrationToday: { ...seedState.hydrationToday },
      hydrationHistory: [...seedState.hydrationHistory],
      tasks: [...seedState.tasks],
      taskCompletions: [...seedState.taskCompletions],
      taskCategories: [...seedState.taskCategories],
      habits: [...seedState.habits],
      preferences: { ...seedState.preferences },
      isReady: true,
      activeTaskFilter: 'all',
    }));
  });

  it('returns the app to the seed state', async () => {
    useAppStore.setState((state) => ({
      ...state,
      tasks: [],
      habits: [],
      hydrationToday: {
        ...state.hydrationToday,
        consumedMl: 0,
        entries: [],
      },
      preferences: {
        ...state.preferences,
        hasCompletedOnboarding: true,
        hasSeenAppTour: true,
        displayName: 'Tester',
      },
      isReady: true,
    }));

    await useAppStore.getState().resetAllData();

    const nextState = useAppStore.getState();
    const seedState = createSeedState();

    expect(resetAppState).toHaveBeenCalled();
    expect(nextState.preferences.displayName).toBe(
      seedState.preferences.displayName,
    );
    expect(nextState.preferences.hasCompletedOnboarding).toBe(
      seedState.preferences.hasCompletedOnboarding,
    );
    expect(nextState.tasks).toHaveLength(seedState.tasks.length);
    expect(nextState.habits).toHaveLength(seedState.habits.length);
    expect(nextState.hydrationToday.entries).toHaveLength(
      seedState.hydrationToday.entries.length,
    );
  });

  it('updates hydration derived state when water is added', () => {
    useAppStore.setState((state) => ({
      ...state,
      hydrationToday: {
        ...state.hydrationToday,
        consumedMl: 2400,
        entries: [],
        isGoalReached: false,
        overflowMl: 0,
      },
      preferences: {
        ...state.preferences,
        dailyWaterTargetMl: 2500,
      },
    }));

    useAppStore.getState().addWater(200, 'quick');

    const nextState = useAppStore.getState();

    expect(nextState.hydrationToday.consumedMl).toBe(2600);
    expect(nextState.hydrationToday.isGoalReached).toBe(true);
    expect(nextState.hydrationToday.overflowMl).toBe(100);
    expect(nextState.hydrationToday.entries[0]?.amountMl).toBe(200);
  });

  it('archives categories with a timestamp, moves tasks to fallback and restores only the category', () => {
    useAppStore.setState((state) => ({
      ...state,
      taskCategories: [
        {
          id: 'work',
          label: 'Work',
          color: '#E5EAF1',
          kind: 'preset',
          archived: false,
          archivedAt: null,
        },
        {
          id: 'side-project',
          label: 'Side project',
          color: '#EFE2FB',
          kind: 'custom',
          archived: false,
          archivedAt: null,
        },
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'Ship build',
          notes: '',
          priority: 'high',
          repeatRule: { type: 'none' },
          categoryId: 'side-project',
          dueAt: '2026-04-17T10:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
      ],
    }));

    useAppStore.getState().archiveTaskCategory('side-project', 'work');

    let nextState = useAppStore.getState();
    expect(
      nextState.taskCategories.find(
        (category) => category.id === 'side-project',
      ),
    ).toMatchObject({
      archived: true,
    });
    expect(
      nextState.taskCategories.find(
        (category) => category.id === 'side-project',
      )?.archivedAt,
    ).toEqual(expect.any(String));
    expect(nextState.tasks[0]?.categoryId).toBe('work');

    useAppStore.getState().restoreTaskCategory('side-project');

    nextState = useAppStore.getState();
    expect(
      nextState.taskCategories.find(
        (category) => category.id === 'side-project',
      ),
    ).toMatchObject({
      archived: false,
      archivedAt: null,
    });
    expect(nextState.tasks[0]?.categoryId).toBe('work');
  });
});
