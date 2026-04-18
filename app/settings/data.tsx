import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { exportStateToJson } from '@/shared/services/data-transfer';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function DataSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
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
          Data
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          Export and import stay local. Reset is destructive and always asks for
          confirmation.
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
            Safe actions
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
                Export JSON
              </Text>
              <Text
                style={[
                  styles.actionBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Save a portable snapshot of tasks, habits, hydration history and
                preferences.
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
                Import JSON
              </Text>
              <Text
                style={[
                  styles.actionBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Restore a previous export through the built-in migration
                pipeline.
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
            Destructive
          </Text>
          <Text
            style={[styles.sectionBody, { color: theme.colors.textSecondary }]}
          >
            Reset replaces local data with the clean starter state. Export first
            if you may need this data later.
          </Text>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Reset all data',
                'This will replace local data with seed content.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
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
              Reset local data
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
