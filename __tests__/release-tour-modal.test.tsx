/* eslint-disable @typescript-eslint/no-require-imports */
import { act, fireEvent, render } from '@testing-library/react-native';

import { createSeedState } from '@/shared/storage/seed';
import { useAppStore } from '@/shared/store/app-store';
import { useUiStore } from '@/shared/store/ui-store';
import { ReleaseTourModal } from '@/shared/ui/release-tour-modal';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: any) => <Text>{name}</Text>,
    MaterialIcons: ({ name }: any) => <Text>{name}</Text>,
  };
});

describe('ReleaseTourModal', () => {
  beforeEach(() => {
    mockNavigate.mockReset();

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
    useUiStore.setState({
      pendingQuickAction: null,
      gestureBlockers: [],
      lastArchivedItem: null,
    });
  });

  it('opens the task builder from the first step', () => {
    const screen = render(<ReleaseTourModal onFinish={jest.fn()} visible />);

    expect(screen.getByText('Create your first task')).toBeTruthy();

    fireEvent.press(screen.getByText('Open task builder'));

    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    expect(useUiStore.getState().pendingQuickAction).toBe('open-create-task');
  });

  it('advances after the first task and habit are created', () => {
    const screen = render(<ReleaseTourModal onFinish={jest.fn()} visible />);

    act(() => {
      useAppStore.setState((state) => ({
        ...state,
        tasks: [
          {
            id: 'task-1',
            title: 'First task',
            notes: '',
            priority: 'medium',
            repeatRule: { type: 'none' },
            categoryId: 'work',
            dueAt: '2026-04-18T09:00:00.000Z',
            completedAt: null,
            archived: false,
            archivedAt: null,
          },
        ],
      }));
    });

    expect(screen.getByText('Build a habit from scratch')).toBeTruthy();

    act(() => {
      useAppStore.setState((state) => ({
        ...state,
        habits: [
          {
            id: 'habit-1',
            name: 'Read',
            icon: 'book',
            accentColor: '#DCEEFF',
            goalMode: 'daily',
            targetPerPeriod: 1,
            schedule: { days: [1, 2, 3, 4, 5] },
            archived: false,
            archivedAt: null,
            reminder: { enabled: false, time: null },
            completions: [],
          },
        ],
      }));
    });

    expect(screen.getByText('Everything is ready')).toBeTruthy();
  });
});
