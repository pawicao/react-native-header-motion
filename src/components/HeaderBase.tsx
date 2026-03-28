import { useMemo, type ReactElement } from 'react';
import { Platform, StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useAnimatedReaction, withDecay } from 'react-native-reanimated';
import type {
  HeaderPanDecayConfig,
  HeaderPanDecayEvent,
  HeaderMotionBridgeValue,
} from '../types';

const PLATFORM_PANNING_ENABLED = Platform.select({
  default: true,
  android: false,
});

type HeaderPanBoundaryProps = Pick<
  HeaderMotionBridgeValue,
  'scrollToRef' | 'headerPanMomentumOffset'
> & {
  children: ReactElement;
  enableHeaderPan?: boolean;
  headerPanDecayConfig?: HeaderPanDecayConfig;
  withGestureHandlerRootView?: boolean;
};

export const headerOverlayStyle = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
}).overlay;

export function HeaderPanBoundary({
  children,
  enableHeaderPan = false,
  headerPanDecayConfig,
  scrollToRef,
  headerPanMomentumOffset,
  withGestureHandlerRootView = false,
}: HeaderPanBoundaryProps) {
  useAnimatedReaction(
    () => headerPanMomentumOffset.get(),
    (offset, prevOffset) => {
      if (offset !== null) {
        const dy = offset - (prevOffset ?? 0);
        scrollToRef.current?.(dy);
      }
    }
  );

  const isPanEnabled = PLATFORM_PANNING_ENABLED && enableHeaderPan;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isPanEnabled)
        .onChange((e) => {
          const dy = e.changeY;
          scrollToRef.current?.(dy);
        })
        .onEnd((e) => {
          const resolvedConfig = resolveHeaderPanDecayConfig(
            headerPanDecayConfig,
            e
          );
          headerPanMomentumOffset.set(
            withDecay(resolvedConfig, () => headerPanMomentumOffset.set(null))
          );
        })
        .shouldCancelWhenOutside(false),
    [headerPanDecayConfig, headerPanMomentumOffset, isPanEnabled, scrollToRef]
  );

  const content = <GestureDetector gesture={pan}>{children}</GestureDetector>;

  if (!withGestureHandlerRootView) {
    return content;
  }

  return <GestureHandlerRootView>{content}</GestureHandlerRootView>;
}

function resolveHeaderPanDecayConfig(
  headerPanDecayConfig: HeaderPanDecayConfig | undefined,
  event: HeaderPanDecayEvent
) {
  'worklet';

  const resolvedConfig =
    typeof headerPanDecayConfig === 'function'
      ? headerPanDecayConfig(event)
      : headerPanDecayConfig;

  return {
    ...resolvedConfig,
    velocity: resolvedConfig?.velocity ?? event.velocityY,
  };
}
