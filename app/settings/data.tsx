import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { exportStateToJson } from '@/shared/services/data-transfer';
import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function DataSettingsScreen() {
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
      <View style={styles.card}>
        <Text style={styles.title}>Data</Text>
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
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Export JSON</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            await importAppState();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Import JSON</Text>
        </Pressable>
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
                    void resetAllData();
                  },
                },
              ],
            )
          }
          style={[styles.button, styles.dangerButton]}
        >
          <Text style={styles.dangerLabel}>Reset local data</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    ...shadows.button,
  },
  buttonLabel: { ...typography.bodyStrong, color: colors.surface },
  dangerButton: { backgroundColor: '#FCE5E5' },
  dangerLabel: { ...typography.bodyStrong, color: colors.accentRed },
});
