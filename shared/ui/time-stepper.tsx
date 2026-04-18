import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatTimeLabel, shiftTimeValue } from '@/shared/lib/date';
import { radii, spacing, typography, useTheme } from '@/shared/theme';
import type { TimeFormat } from '@/shared/types/app';

interface TimeStepperProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  presets?: string[];
  timeFormat: TimeFormat;
  disabled?: boolean;
  minuteStep?: number;
}

export function TimeStepper({
  label,
  value,
  onChange,
  presets = [],
  timeFormat,
  disabled = false,
  minuteStep = 15,
}: TimeStepperProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.row}>
        <Pressable
          disabled={disabled}
          onPress={() => onChange(shiftTimeValue(value, -minuteStep))}
          style={[
            styles.stepButton,
            {
              opacity: disabled ? 0.45 : 1,
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <Text style={[styles.stepLabel, { color: theme.colors.textPrimary }]}>
            -{minuteStep}m
          </Text>
        </Pressable>
        <View
          style={[
            styles.valueCard,
            {
              backgroundColor: theme.colors.input,
              opacity: disabled ? 0.45 : 1,
            },
          ]}
        >
          <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>
            {formatTimeLabel(value, timeFormat)}
          </Text>
        </View>
        <Pressable
          disabled={disabled}
          onPress={() => onChange(shiftTimeValue(value, minuteStep))}
          style={[
            styles.stepButton,
            {
              opacity: disabled ? 0.45 : 1,
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <Text style={[styles.stepLabel, { color: theme.colors.textPrimary }]}>
            +{minuteStep}m
          </Text>
        </Pressable>
      </View>
      {presets.length ? (
        <View style={styles.presetRow}>
          {presets.map((preset) => {
            const active = preset === value;
            return (
              <Pressable
                key={preset}
                disabled={disabled}
                onPress={() => onChange(preset)}
                style={[
                  styles.presetChip,
                  {
                    opacity: disabled ? 0.45 : 1,
                    backgroundColor: active
                      ? theme.colors.brand
                      : theme.colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetLabel,
                    {
                      color: active
                        ? theme.colors.textOnTint
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {formatTimeLabel(preset, timeFormat)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    minWidth: 74,
    minHeight: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { ...typography.bodyStrong, fontSize: 15 },
  valueCard: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  valueText: { ...typography.bodyStrong, textAlign: 'center' },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  presetLabel: { ...typography.caption, fontSize: 14 },
});
