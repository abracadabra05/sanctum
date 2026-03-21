import { Feather, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, spacing, typography } from '@/shared/theme';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerCaption?: string;
  variant?: 'water' | 'focus';
  successState?: boolean;
}

export function ProgressRing({
  percentage,
  size = 210,
  thickness = 22,
  centerLabel,
  centerCaption,
  variant = 'water',
  successState = false,
}: ProgressRingProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="#EDF2F8"
          strokeWidth={thickness}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          stroke={colors.brand}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={thickness}
        />
      </Svg>
      <View style={styles.center}>
        {successState ? (
          <View style={styles.successWrap}>
            <Feather color={colors.surface} name="check" size={26} />
          </View>
        ) : variant === 'water' ? (
          <Ionicons color={colors.brandStrong} name="water" size={26} />
        ) : (
          <Feather color={colors.brandStrong} name="check" size={24} />
        )}
        {centerLabel ? <Text style={styles.label}>{centerLabel}</Text> : null}
        {centerCaption ? (
          <Text style={styles.caption}>{centerCaption}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  successWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  caption: {
    ...typography.caption,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
