/* eslint-disable @typescript-eslint/no-require-imports */
import { render } from '@testing-library/react-native';

import DashboardScreen from '@/app/(tabs)/index';
import { createSeedState } from '@/shared/storage/seed';
import { useAppStore } from '@/shared/store/app-store';

jest.mock('expo-router', () => ({
  router: {
    navigate: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: any) => <Text>{name}</Text>,
  };
});

jest.mock('@/shared/ui/screen-shell', () => {
  const { View } = require('react-native');
  return {
    ScreenShell: ({ children, header }: any) => (
      <View>
        {header}
        {children}
      </View>
    ),
  };
});

jest.mock('@/shared/ui/section-heading', () => {
  const { Text, View } = require('react-native');
  return {
    SectionHeading: ({ eyebrow, title, actionLabel }: any) => (
      <View>
        {eyebrow ? <Text>{eyebrow}</Text> : null}
        <Text>{title}</Text>
        {actionLabel ? <Text>{actionLabel}</Text> : null}
      </View>
    ),
  };
});

jest.mock('@/shared/ui/progress-ring', () => {
  const { Text } = require('react-native');
  return {
    ProgressRing: ({ centerLabel }: any) => (
      <Text>{centerLabel ?? 'ring'}</Text>
    ),
  };
});

jest.mock('@/shared/ui/task-card', () => {
  const { Text } = require('react-native');
  return {
    TaskCard: ({ item }: any) => <Text>{item.task.title}</Text>,
  };
});

jest.mock('@/shared/ui/habit-card', () => {
  const { Text } = require('react-native');
  return {
    HabitCard: ({ habit }: any) => <Text>{habit.name}</Text>,
  };
});

jest.mock('@/shared/ui/empty-state', () => {
  const { Text, View } = require('react-native');
  return {
    EmptyState: ({ title, description }: any) => (
      <View>
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
    ),
  };
});

jest.mock('@/shared/ui/radial-fab', () => ({
  RadialFab: () => null,
}));

jest.mock('@/shared/ui/create-task-sheet', () => ({
  CreateTaskSheet: () => null,
}));

jest.mock('@/shared/ui/create-habit-sheet', () => ({
  CreateHabitSheet: () => null,
}));

jest.mock('@/shared/ui/app-menu', () => ({
  AppMenu: () => null,
}));

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-17T12:00:00.000Z'));

    const seedState = createSeedState();
    useAppStore.setState((state) => ({
      ...state,
      ...seedState,
      hydrationToday: {
        ...seedState.hydrationToday,
        date: '2026-04-17',
        consumedMl: 0,
        entries: [],
        isGoalReached: false,
        overflowMl: 0,
      },
      tasks: [
        {
          id: 'task-1',
          title: 'Completed today',
          notes: '',
          priority: 'medium',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-17T09:00:00.000Z',
          completedAt: null,
          archived: false,
          archivedAt: null,
        },
      ],
      taskCompletions: [
        {
          taskId: 'task-1',
          occurrenceDate: '2026-04-17',
          completedAt: '2026-04-17T09:05:00.000Z',
        },
      ],
      taskCategories: [
        {
          id: 'work',
          label: 'Work',
          color: '#E5EAF1',
          kind: 'preset',
          archived: false,
          archivedAt: null,
        },
      ],
      habits: [],
      isReady: true,
      activeTaskFilter: 'all',
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the completion empty state when today tasks are already done', () => {
    const screen = render(<DashboardScreen />);

    expect(screen.getByText('All done')).toBeTruthy();
    expect(screen.getByText('Nothing active is left for today.')).toBeTruthy();
    expect(screen.queryByText('Completed today')).toBeNull();
  });
});
