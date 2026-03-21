import Constants from 'expo-constants';

import {
  addDays,
  addMinutes,
  combineDateAndTime,
  fromDateKey,
  isAfterClockTime,
  toDateKey,
} from '@/shared/lib/date';
import type { AppState, HabitItem } from '@/shared/types/app';

let notificationsModulePromise: Promise<
  typeof import('expo-notifications')
> | null = null;
let handlerConfigured = false;

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

const loadNotifications = async () => {
  if (isExpoGo) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications');
  }

  const Notifications = await notificationsModulePromise;

  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return Notifications;
};

const WATER_IDENTIFIER = 'water-reminder';
const HABIT_IDENTIFIER = 'habit-reminder';

export const requestNotificationPermissions = async () => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
};

const cancelTaggedNotifications = async (tag: string) => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.tag === tag)
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
  );
};

export const syncWaterNotifications = async (state: AppState) => {
  if (!state.preferences.notificationsEnabled || isExpoGo) {
    return;
  }

  await cancelTaggedNotifications(WATER_IDENTIFIER);

  if (state.hydrationToday.isGoalReached) {
    return;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  const interval = state.preferences.waterReminderIntervalMinutes ?? 90;
  const cutoff = state.preferences.waterReminderCutoffTime ?? '22:00';
  const now = new Date();

  for (let step = 1; step <= 6; step += 1) {
    const triggerDate = addMinutes(now, interval * step);
    if (isAfterClockTime(triggerDate, cutoff)) {
      break;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hydration check-in',
        body: 'A small glass now keeps your rhythm steady.',
        data: { tag: WATER_IDENTIFIER },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
};

const habitShouldRunOnDate = (habit: HabitItem, dateKey: string) => {
  const date = fromDateKey(dateKey);
  return habit.schedule.days.includes(
    date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  );
};

export const syncHabitNotifications = async (state: AppState) => {
  if (!state.preferences.notificationsEnabled || isExpoGo) {
    return;
  }

  await cancelTaggedNotifications(HABIT_IDENTIFIER);

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  const tomorrowKey = toDateKey(addDays(new Date(), 1));
  const todayKey = toDateKey(new Date());
  const keys = [todayKey, tomorrowKey];

  for (const habit of state.habits.filter(
    (item) => !item.archived && item.reminder.enabled && item.reminder.time,
  )) {
    for (const dateKey of keys) {
      if (!habitShouldRunOnDate(habit, dateKey)) {
        continue;
      }

      const date = new Date(combineDateAndTime(dateKey, habit.reminder.time!));
      if (date.getTime() <= Date.now()) {
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: habit.name,
          body: 'Your planned habit is ready to be completed.',
          data: { tag: HABIT_IDENTIFIER, habitId: habit.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
    }
  }
};
