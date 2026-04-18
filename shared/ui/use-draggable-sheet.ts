import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import {
  State as GestureState,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { useUiStore } from '@/shared/store/ui-store';

interface UseDraggableSheetOptions {
  visible: boolean;
  onClose: () => void;
  sheetBlockKey: string;
  dragBlockKey: string;
}

const CLOSED_TRANSLATE_Y = 800;

export function useDraggableSheet({
  visible,
  onClose,
  sheetBlockKey,
  dragBlockKey,
}: UseDraggableSheetOptions) {
  const setGestureBlock = useUiStore((state) => state.setGestureBlock);
  const translateYValue = useRef(
    new Animated.Value(CLOSED_TRANSLATE_Y),
  ).current;
  const overlayOpacity = translateYValue.interpolate({
    inputRange: [0, 260, CLOSED_TRANSLATE_Y],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    setGestureBlock(sheetBlockKey, visible);

    if (!visible) {
      translateYValue.setValue(CLOSED_TRANSLATE_Y);
      return;
    }

    translateYValue.setValue(CLOSED_TRANSLATE_Y);
    Animated.spring(translateYValue, {
      toValue: 0,
      damping: 18,
      stiffness: 180,
      useNativeDriver: true,
    }).start();

    return () => {
      setGestureBlock(sheetBlockKey, false);
      setGestureBlock(dragBlockKey, false);
    };
  }, [dragBlockKey, setGestureBlock, sheetBlockKey, translateYValue, visible]);

  const closeSheet = useCallback(() => {
    setGestureBlock(dragBlockKey, false);
    Animated.timing(translateYValue, {
      toValue: CLOSED_TRANSLATE_Y,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [dragBlockKey, onClose, setGestureBlock, translateYValue]);

  const resetSheetPosition = useCallback(() => {
    Animated.spring(translateYValue, {
      toValue: 0,
      damping: 18,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [translateYValue]);

  const handleSheetGestureEvent = useCallback(
    ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
      translateYValue.setValue(Math.max(0, nativeEvent.translationY));
    },
    [translateYValue],
  );

  const handleSheetStateChange = useCallback(
    ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
      if (nativeEvent.state === GestureState.ACTIVE) {
        setGestureBlock(dragBlockKey, true);
        return;
      }

      if (nativeEvent.oldState === GestureState.ACTIVE) {
        setGestureBlock(dragBlockKey, false);
        if (nativeEvent.translationY > 118 || nativeEvent.velocityY > 900) {
          closeSheet();
          return;
        }

        resetSheetPosition();
        return;
      }

      if (
        nativeEvent.state === GestureState.CANCELLED ||
        nativeEvent.state === GestureState.END ||
        nativeEvent.state === GestureState.FAILED
      ) {
        setGestureBlock(dragBlockKey, false);
      }
    },
    [closeSheet, dragBlockKey, resetSheetPosition, setGestureBlock],
  );

  return {
    closeSheet,
    handleSheetGestureEvent,
    handleSheetStateChange,
    overlayOpacity,
    translateYValue,
  };
}
