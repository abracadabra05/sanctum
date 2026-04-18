import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import { exportStateToJson } from '@/shared/services/data-transfer';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function DataSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useI18n();
  const schemaVersion = useAppStore((store) => store.schemaVersion);
  const hydrationToday = useAppStore((store) => store.hydrationToday);
  const hydrationHistory = useAppStore((store) => store.hydrationHistory);
  const tasks = useAppStore((store) => store.tasks);
  const taskCompletions = useAppStore((store) => store.taskCompletions);
  const taskCategories = useAppStore((store) => store.taskCategories);
  const habits = useAppStore((store) => store.habits);
  const preferences = useAppStore((store) => store.preferences);
  const importAppState = useAppStore((store) => store.importAppState);
  const resetAllData = useAppStore((store) => store.resetAllData);

  return (
    <ScreenShell>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceElevated,
            shadowColor: theme.shadows.card.shadowColor,
            shadowOffset: theme.shadows.card.shadowOffset,
            shadowOpacity: theme.shadows.card.shadowOpacity,
            shadowRadius: theme.shadows.card.shadowRadius,
            elevation: theme.shadows.card.elevation,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {t('settings.data.title')}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {t('settings.data.body')}
        </Text>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surfaceMuted },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            {t('settings.data.safeTitle')}
          </Text>
          <Pressable
            onPress={async () => {
              await exportStateToJson({
                schemaVersion,
                hydrationToday,
                hydrationHistory,
                tasks,
                taskCompletions,
                taskCategories,
                habits,
                preferences,
              });
            }}
            style={[
              styles.actionRow,
              { backgroundColor: theme.colors.surfaceFloating },
            ]}
          >
            <View style={styles.actionCopy}>
              <Text
                style={[
                  styles.actionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('settings.data.exportTitle')}
              </Text>
              <Text
                style={[
                  styles.actionBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('settings.data.exportBody')}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={async () => {
              await importAppState();
            }}
            style={[
              styles.actionRow,
              { backgroundColor: theme.colors.surfaceFloating },
            ]}
          >
            <View style={styles.actionCopy}>
              <Text
                style={[
                  styles.actionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('settings.data.importTitle')}
              </Text>
              <Text
                style={[
                  styles.actionBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('settings.data.importBody')}
              </Text>
            </View>
          </Pressable>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surfaceDanger },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            {t('settings.data.destructiveTitle')}
          </Text>
          <Text
            style={[styles.sectionBody, { color: theme.colors.textSecondary }]}
          >
            {t('settings.data.destructiveBody')}
          </Text>
          <Pressable
            onPress={() =>
              Alert.alert(
                t('settings.data.resetAlertTitle'),
                t('settings.data.resetAlertBody'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('settings.data.resetButton'),
                    style: 'destructive',
                    onPress: () => {
                      void (async () => {
                        await resetAllData();
                        router.replace('/');
                      })();
                    },
                  },
                ],
              )
            }
            style={[
              styles.dangerButton,
              { backgroundColor: theme.colors.accentRedSoft },
            ]}
          >
            <Text
              style={[styles.dangerLabel, { color: theme.colors.accentRed }]}
            >
              {t('settings.data.resetButton')}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.lg,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  title: { ...typography.h1 },
  body: { ...typography.body },
  section: {
    borderRadius: 24,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { ...typography.bodyStrong },
  sectionBody: { ...typography.caption, lineHeight: 18 },
  actionRow: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionCopy: { gap: 4 },
  actionTitle: { ...typography.bodyStrong, fontSize: 16 },
  actionBody: { ...typography.caption, lineHeight: 18 },
  dangerButton: {
    minHeight: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  dangerLabel: { ...typography.bodyStrong },
});
