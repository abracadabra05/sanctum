import { create } from 'zustand';

export type QuickAction =
  | 'open-task-search'
  | 'open-create-task'
  | 'open-create-habit';

export interface ArchivedUndoItem {
  id: string;
  kind: 'task' | 'habit';
  title: string;
}

interface UiStore {
  pendingQuickAction: QuickAction | null;
  gestureBlockers: string[];
  isNavigationGestureBlocked: boolean;
  lastArchivedItem: ArchivedUndoItem | null;
  queueQuickAction: (action: QuickAction) => void;
  consumeQuickAction: () => QuickAction | null;
  setGestureBlock: (reason: string, active: boolean) => void;
  setLastArchivedItem: (item: ArchivedUndoItem | null) => void;
  clearLastArchivedItem: () => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  pendingQuickAction: null,
  gestureBlockers: [],
  isNavigationGestureBlocked: false,
  lastArchivedItem: null,
  queueQuickAction: (action) => {
    set({ pendingQuickAction: action });
  },
  consumeQuickAction: () => {
    const action = get().pendingQuickAction;
    if (action) {
      set({ pendingQuickAction: null });
    }
    return action;
  },
  setGestureBlock: (reason, active) => {
    set((state) => {
      const gestureBlockers = active
        ? state.gestureBlockers.includes(reason)
          ? state.gestureBlockers
          : [...state.gestureBlockers, reason]
        : state.gestureBlockers.filter((item) => item !== reason);

      return {
        gestureBlockers,
        isNavigationGestureBlocked: gestureBlockers.length > 0,
      };
    });
  },
  setLastArchivedItem: (item) => {
    set({ lastArchivedItem: item });
  },
  clearLastArchivedItem: () => {
    set({ lastArchivedItem: null });
  },
}));
