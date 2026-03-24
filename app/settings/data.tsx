import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { exportStateToJson } from '@/shared/services/data-transfer';
import { useAppStore } from '@/shared/store/app-store';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

export default function DataSettingsScreen() {
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
          style={[styles.button, { backgroundColor: theme.colors.brand }]}
        >
          <Text style={[styles.buttonLabel, { color: theme.colors.surface }]}>
            Export JSON
          </Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            await importAppState();
          }}
          style={[styles.button, { backgroundColor: theme.colors.brand }]}
        >
          <Text style={[styles.buttonLabel, { color: theme.colors.surface }]}>
            Import JSON
          </Text>
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
          style={[
            styles.button,
            { backgroundColor: theme.colors.accentRedSoft },
          ]}
        >
          <Text style={[styles.dangerLabel, { color: theme.colors.accentRed }]}>
            Reset local data
          </Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.md,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  title: { ...typography.h1 },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...typography.bodyStrong },
  dangerLabel: { ...typography.bodyStrong },
});
