import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUiStore } from '@/shared/store/ui-store';
import { spacing, typography, useTheme } from '@/shared/theme';

export interface RadialFabItem {
  id: string;
  label: string;
  icon: { name: string; type: 'ionicon' | 'material' };
  onPress: () => void;
}

interface RadialFabProps {
  items: RadialFabItem[];
  onPress: () => void;
  longPressDelay?: number;
}

const BASE_ARC_RADIUS = 82;
const ARC_RADIUS_STEP = 28;
const MAIN_SIZE = 56;
const ITEM_SIZE = 48;
const ANIM_DURATION = 240;

function calcArcOffset(index: number, total: number) {
  if (total === 3) {
    return [
      { x: -104, y: -24 },
      { x: -36, y: -108 },
      { x: -8, y: -188 },
    ][index];
  }

  const startAngle = 165;
  const endAngle = 100;
  const angleDeg =
    total <= 1
      ? 132
      : startAngle - (startAngle - endAngle) * (index / (total - 1));
  const angleRad = (angleDeg * Math.PI) / 180;
  const radius = BASE_ARC_RADIUS + index * ARC_RADIUS_STEP;
  return {
    x: radius * Math.cos(angleRad),
    y: -radius * Math.sin(angleRad),
  };
}

export function RadialFab({
  items,
  onPress,
  longPressDelay = 200,
}: RadialFabProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOpenRef = useRef(false);
  const hoveredIndexRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemAnims = useMemo(
    () =>
      items.map(() => ({
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(0.1),
        opacity: new Animated.Value(0),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length],
  );

  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openMenu = useCallback(() => {
    isOpenRef.current = true;
    setMenuOpen(true);

    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start();

    items.forEach((_, index) => {
      const offset = calcArcOffset(index, items.length);
      const a = itemAnims[index];
      Animated.parallel([
        Animated.spring(a.translateX, {
          toValue: offset.x,
          damping: 14,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.spring(a.translateY, {
          toValue: offset.y,
          damping: 14,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.spring(a.scale, {
          toValue: 1,
          damping: 14,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [backdropOpacity, itemAnims, items]);

  const closeMenu = useCallback(() => {
    isOpenRef.current = false;
    setMenuOpen(false);
    setHoveredIndex(null);
    hoveredIndexRef.current = null;

    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: ANIM_DURATION,
      useNativeDriver: true,
    }).start();

    items.forEach((_, index) => {
      const a = itemAnims[index];
      Animated.parallel([
        Animated.timing(a.translateX, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(a.translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(a.scale, {
          toValue: 0.1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(a.opacity, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [backdropOpacity, itemAnims, items]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setGestureBlock('radial-fab', menuOpen);
  }, [menuOpen, setGestureBlock]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          timerRef.current = setTimeout(() => {
            openMenu();
          }, longPressDelay);
        },
        onPanResponderMove: (_, gestureState) => {
          const { dx, dy } = gestureState;

          if (!isOpenRef.current) {
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
              if (timerRef.current) clearTimeout(timerRef.current);
            }
            return;
          }

          let foundHover: number | null = null;
          items.forEach((_, index) => {
            const offset = calcArcOffset(index, items.length);
            const dist = Math.sqrt(
              Math.pow(dx - offset.x, 2) + Math.pow(dy - offset.y, 2),
            );
            if (dist < 45) {
              foundHover = index;
            }
          });

          if (hoveredIndexRef.current !== foundHover) {
            hoveredIndexRef.current = foundHover;
            setHoveredIndex(foundHover);
          }
        },
        onPanResponderRelease: () => {
          if (timerRef.current) clearTimeout(timerRef.current);

          if (isOpenRef.current) {
            const selected = hoveredIndexRef.current;
            closeMenu();
            if (selected !== null) {
              setTimeout(() => {
                items[selected].onPress();
              }, 50);
            }
            return;
          }

          onPress();
        },
        onPanResponderTerminate: () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (isOpenRef.current) {
            closeMenu();
          }
        },
      }),
    [closeMenu, items, longPressDelay, onPress, openMenu],
  );

  return (
    <>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.15)',
            opacity: backdropOpacity,
            zIndex: 99,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[styles.root, { bottom: insets.bottom + spacing.md }]}
        pointerEvents="box-none"
      >
        {items.map((item, index) => {
          const a = itemAnims[index];
          const isHovered = hoveredIndex === index;
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.itemAnchor,
                {
                  transform: [
                    { translateX: a.translateX },
                    { translateY: a.translateY },
                    { scale: isHovered ? 1.08 : a.scale },
                  ],
                  opacity: a.opacity,
                },
              ]}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.itemButton,
                  {
                    backgroundColor: isHovered
                      ? theme.colors.brand
                      : theme.colors.surfaceFloating,
                    shadowColor: theme.shadows.card.shadowColor,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.itemLabel,
                    {
                      color: isHovered
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
                {item.icon.type === 'ionicon' ? (
                  <Ionicons
                    color={
                      isHovered ? theme.colors.surface : theme.colors.brand
                    }
                    name={item.icon.name as any}
                    size={20}
                  />
                ) : (
                  <MaterialIcons
                    color={
                      isHovered ? theme.colors.surface : theme.colors.brand
                    }
                    name={item.icon.name as any}
                    size={20}
                  />
                )}
              </View>
            </Animated.View>
          );
        })}

        <View
          {...panResponder.panHandlers}
          style={[
            styles.mainButton,
            {
              backgroundColor: theme.colors.surfaceFloating,
              shadowColor: theme.shadows.button.shadowColor,
              shadowOffset: theme.shadows.button.shadowOffset,
              shadowOpacity: theme.shadows.button.shadowOpacity,
              shadowRadius: theme.shadows.button.shadowRadius,
              elevation: theme.shadows.button.elevation,
            },
          ]}
        >
          <Ionicons
            color={theme.colors.brand}
            name="finger-print-outline"
            size={38}
            style={{ opacity: 0.35 }}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: spacing.lg,
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    zIndex: 100,
  },
  itemAnchor: {
    position: 'absolute',
    right: MAIN_SIZE / 2 - ITEM_SIZE / 2,
    bottom: MAIN_SIZE / 2 - ITEM_SIZE / 2,
    height: ITEM_SIZE,
    width: ITEM_SIZE + 124,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      default: { elevation: 4 },
    }),
  },
  itemLabel: {
    ...typography.bodyStrong,
    fontSize: 14,
    flexShrink: 1,
  },
  mainButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    borderRadius: MAIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
