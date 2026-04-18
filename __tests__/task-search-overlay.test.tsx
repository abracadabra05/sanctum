import { render } from '@testing-library/react-native';
import { View as mockView } from 'react-native';

import type { TaskListItemViewModel } from '@/shared/types/app';
import { TaskSearchOverlay } from '@/shared/ui/task-search-overlay';

jest.mock('expo-blur', () => ({
  BlurView: mockView,
}));

const results: TaskListItemViewModel[] = [
  {
    task: {
      id: 'task-1',
      title: 'Morning review',
      notes: 'Check notes',
      priority: 'medium',
      repeatRule: { type: 'none' },
      categoryId: 'work',
      dueAt: '2026-04-17T08:00:00.000Z',
      completedAt: null,
      archived: false,
      archivedAt: null,
    },
    category: {
      id: 'work',
      label: 'Work',
      color: '#E5EAF1',
      kind: 'preset',
      archived: false,
      archivedAt: null,
    },
    occurrence: {
      occurrenceDate: '2026-04-17',
      displayTime: '08:00',
      isCompleted: false,
    },
    searchText: 'morning review',
  },
];

describe('TaskSearchOverlay', () => {
  it('shows the current task list when the query is cleared', () => {
    const screen = render(
      <TaskSearchOverlay
        includeArchived={false}
        onChangeQuery={jest.fn()}
        onClose={jest.fn()}
        onToggleIncludeArchived={jest.fn()}
        query=""
        results={results}
        scopeLabel="All active tasks"
        visible
      />,
    );

    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getAllByText('All active tasks')).toHaveLength(2);
    expect(screen.getByText('Morning review')).toBeTruthy();
    expect(screen.queryByText('Nothing found')).toBeNull();
  });
});
