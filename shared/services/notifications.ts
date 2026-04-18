import Constants from 'expo-constants';

import { translate } from '@/shared/i18n/messages';
import {
  buildHabitReminderDates,
  buildWaterReminderDates,
} from '@/shared/services/notification-schedule';
import type { AppState } from '@/shared/types/app';

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

  for (const triggerDate of buildWaterReminderDates(
    new Date(),
    state.preferences.waterReminderIntervalMinutes ?? 90,
    state.preferences.waterReminderCutoffTime ?? '22:00',
  )) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: translate(
          state.preferences.language,
          'notifications.water.title',
        ),
        body: translate(state.preferences.language, 'notifications.water.body'),
        data: { tag: WATER_IDENTIFIER },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
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

  for (const habit of state.habits.filter(
    (item) => !item.archived && item.reminder.enabled && item.reminder.time,
  )) {
    for (const date of buildHabitReminderDates(habit, new Date())) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: habit.name,
          body: translate(
            state.preferences.language,
            'notifications.habit.body',
          ),
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
