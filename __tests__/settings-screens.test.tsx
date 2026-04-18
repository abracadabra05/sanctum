/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render } from '@testing-library/react-native';

import ArchiveCenterScreen from '@/app/settings/archive';
import CategoriesSettingsScreen from '@/app/settings/categories';
import { createSeedState } from '@/shared/storage/seed';
import { useAppStore } from '@/shared/store/app-store';

jest.mock('@/shared/ui/screen-shell', () => {
  const { View } = require('react-native');
  return {
    ScreenShell: ({ children }: any) => <View>{children}</View>,
  };
});

describe('settings screens', () => {
  beforeEach(() => {
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

  it('shows an inline error when the category name is empty', () => {
    const screen = render(<CategoriesSettingsScreen />);

    fireEvent.press(screen.getByText('Create category'));

    expect(screen.getByText('Category name is required.')).toBeTruthy();
  });

  it('filters archive items by entity type', () => {
    useAppStore.setState((state) => ({
      ...state,
      tasks: [
        {
          id: 'task-archived',
          title: 'Archived task',
          notes: '',
          priority: 'medium',
          repeatRule: { type: 'none' },
          categoryId: 'work',
          dueAt: '2026-04-17T09:00:00.000Z',
          completedAt: null,
          archived: true,
          archivedAt: '2026-04-17T10:00:00.000Z',
        },
      ],
      habits: [
        {
          id: 'habit-archived',
          name: 'Archived habit',
          icon: 'leaf',
          accentColor: '#CFF4F1',
          goalMode: 'daily',
          targetPerPeriod: 1,
          schedule: { days: [1, 2, 3] },
          archived: true,
          archivedAt: '2026-04-17T11:00:00.000Z',
          reminder: { enabled: false, time: null },
          completions: [],
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
        {
          id: 'category-archived',
          label: 'Archived category',
          color: '#EFE2FB',
          kind: 'custom',
          archived: true,
          archivedAt: '2026-04-17T12:00:00.000Z',
        },
      ],
    }));

    const screen = render(<ArchiveCenterScreen />);

    expect(screen.getByText('Archived task')).toBeTruthy();
    expect(screen.getByText('Archived habit')).toBeTruthy();
    expect(screen.getByText('Archived category')).toBeTruthy();

    fireEvent.press(screen.getByText('Tasks'));
    expect(screen.getByText('Archived task')).toBeTruthy();
    expect(screen.queryByText('Archived habit')).toBeNull();
    expect(screen.queryByText('Archived category')).toBeNull();

    fireEvent.press(screen.getByText('Habits'));
    expect(screen.queryByText('Archived task')).toBeNull();
    expect(screen.getByText('Archived habit')).toBeTruthy();
    expect(screen.queryByText('Archived category')).toBeNull();

    fireEvent.press(screen.getByText('Categories'));
    expect(screen.queryByText('Archived task')).toBeNull();
    expect(screen.queryByText('Archived habit')).toBeNull();
    expect(screen.getByText('Archived category')).toBeTruthy();
  });
});
