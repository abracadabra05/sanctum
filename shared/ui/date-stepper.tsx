import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/shared/i18n';
import { formatDateKeyLabel, shiftDateKey } from '@/shared/lib/date';
import { radii, spacing, typography, useTheme } from '@/shared/theme';

interface DatePreset {
  label: string;
  value: string;
}

interface DateStepperProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  presets?: DatePreset[];
}

export function DateStepper({
  label,
  value,
  onChange,
  presets = [],
}: DateStepperProps) {
  const theme = useTheme();
  const { locale, t } = useI18n();

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(shiftDateKey(value, -1))}
          style={[
            styles.stepButton,
            { backgroundColor: theme.colors.surfaceMuted },
          ]}
        >
          <Text style={[styles.stepLabel, { color: theme.colors.textPrimary }]}>
            -1{t('stepper.dayShort')}
          </Text>
        </Pressable>
        <View
          style={[styles.valueCard, { backgroundColor: theme.colors.input }]}
        >
          <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>
            {formatDateKeyLabel(value, {
              includeWeekday: true,
              includeYear: true,
              locale,
            })}
          </Text>
        </View>
        <Pressable
          onPress={() => onChange(shiftDateKey(value, 1))}
          style={[
            styles.stepButton,
            { backgroundColor: theme.colors.surfaceMuted },
          ]}
        >
          <Text style={[styles.stepLabel, { color: theme.colors.textPrimary }]}>
            +1{t('stepper.dayShort')}
          </Text>
        </Pressable>
      </View>
      {presets.length ? (
        <View style={styles.presetRow}>
          {presets.map((preset) => {
            const active = preset.value === value;
            return (
              <Pressable
                key={preset.label}
                onPress={() => onChange(preset.value)}
                style={[
                  styles.presetChip,
                  {
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
                  {preset.label}
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
    minWidth: 68,
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
