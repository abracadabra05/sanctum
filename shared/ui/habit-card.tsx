import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/shared/theme';
import type { HabitCardViewModel } from '@/shared/types/app';

interface HabitCardProps {
  habit: HabitCardViewModel;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function HabitCard({ habit, onPress, onLongPress }: HabitCardProps) {
  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={[styles.card, { backgroundColor: habit.accentColor }]}
    >
      <View style={styles.iconWrap}>
        {habit.icon === 'sparkles' ? (
          <MaterialIcons
            color={colors.textPrimary}
            name="auto-awesome"
            size={22}
          />
        ) : habit.icon === 'leaf' ? (
          <Ionicons color={colors.textPrimary} name="leaf" size={20} />
        ) : habit.icon === 'book' ? (
          <Ionicons color={colors.textPrimary} name="book" size={20} />
        ) : habit.icon === 'moon' ? (
          <Ionicons color={colors.textPrimary} name="moon" size={20} />
        ) : (
          <Ionicons color={colors.textPrimary} name="ellipse" size={18} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.days}>{habit.streakDays}</Text>
        <Text style={styles.daysLabel}>DAYS</Text>
        <Text style={styles.name}>{habit.name}</Text>
        <Text style={styles.progress}>{habit.progressLabel}</Text>
        {habit.nextReminder ? (
          <Text style={styles.reminder}>Reminder {habit.nextReminder}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 165,
    minHeight: 240,
    borderRadius: radii.tile,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFFCC',
  },
  body: {
    gap: 2,
  },
  days: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  daysLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  name: {
    marginTop: spacing.sm,
    ...typography.h2,
    color: colors.textPrimary,
  },
  progress: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textSecondary,
  },
  reminder: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
