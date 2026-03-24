import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii, spacing, typography } from '@/shared/theme';
import type { HabitCardViewModel } from '@/shared/types/app';

interface HabitCardProps {
  habit: HabitCardViewModel;
  onPress?: () => void;
  onLongPress?: () => void;
}

const titleColor = '#17324D';
const secondaryColor = '#5E738D';

export function HabitCard({ habit, onPress, onLongPress }: HabitCardProps) {
  const icon =
    habit.icon === 'sparkles' ? (
      <MaterialIcons color={titleColor} name="auto-awesome" size={22} />
    ) : habit.icon === 'leaf' ? (
      <Ionicons color={titleColor} name="leaf" size={20} />
    ) : habit.icon === 'book' ? (
      <Ionicons color={titleColor} name="book" size={20} />
    ) : habit.icon === 'moon' ? (
      <Ionicons color={titleColor} name="moon" size={20} />
    ) : (
      <Ionicons color={titleColor} name="ellipse" size={18} />
    );

  return (
    <View>
      <Pressable
        onLongPress={onLongPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: habit.accentColor },
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.iconWrap}>{icon}</View>
        <View style={styles.body}>
          <Text numberOfLines={1} style={[styles.days, { color: titleColor }]}>
            {habit.streakDays}
          </Text>
          <Text style={[styles.daysLabel, { color: secondaryColor }]}>
            DAYS
          </Text>
          <Text numberOfLines={2} style={[styles.name, { color: titleColor }]}>
            {habit.name}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.progress, { color: secondaryColor }]}
          >
            {habit.progressLabel}
          </Text>
          {habit.nextReminder ? (
            <Text
              numberOfLines={1}
              style={[styles.reminder, { color: secondaryColor }]}
            >
              Reminder {habit.nextReminder}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 165,
    minHeight: 220,
    borderRadius: radii.tile,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF55',
  },
  body: {
    gap: 2,
  },
  days: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '700',
  },
  daysLabel: {
    ...typography.caption,
  },
  name: {
    marginTop: spacing.sm,
    ...typography.h2,
  },
  progress: {
    marginTop: spacing.sm,
    ...typography.caption,
  },
  reminder: {
    ...typography.caption,
  },
});
