import { useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  withDecay,
  type AnimatedProps,
} from 'react-native-reanimated';

const PLATFORM_PANNING_ENABLED = Platform.select({
  default: true,
  android: false,
});

import type { MotionProgress } from '../types';

export type HeaderBaseProps = ViewProps;
export type AnimatedHeaderBaseProps = AnimatedProps<ViewProps> &
  Pick<MotionProgress, 'animatedHeaderBaseProps'>;

/**
 * Base header component with absolute positioning.
 * Provides a foundation for building headers that need to be positioned absolutely.
 *
 * @example
 * ```tsx
 * <HeaderBase
 *   onLayout={measureTotalHeight}
 * >
 *   ...
 * </HeaderBase>
 * ```
 */
export function HeaderBase({ style, ...rest }: HeaderBaseProps) {
  return <View style={[style, styles.container]} {...rest} />;
}

/**
 * Animated version of HeaderBase using Reanimated's Animated.View.
 * Use this when you need to animate the header based on scroll progress.
 *
 * @example
 * ```tsx
 * <AnimatedHeaderBase
 *   onLayout={measureTotalHeight}
 *   style={[{ paddingTop: insets.top }, animatedStyle]}
 * >
 *   ...
 * </AnimatedHeaderBase>
 * ```
 */

// TODO: Thinking about DX, perhaps creating another context in AnimatedHeaderBase or somewhere else could make sense
// Note: Depending on feedback, there might be a need to intercept ongoing scroll when starting to pan (perhaps even on the tap itself but to be checked what feels better when using)
// Note: Depending on feedback, there might be a need to block momentum by forcing scrollTo
export function AnimatedHeaderBase({
  style,
  animatedHeaderBaseProps,
  ...rest
}: AnimatedHeaderBaseProps) {
  if (!animatedHeaderBaseProps) {
    throw new Error(
      'AnimatedHeaderBase requires `animatedHeaderBaseProps`. Pass the value from HeaderMotion.Header or useMotionProgress.'
    );
  }

  const {
    enableHeaderPan,
    scrollToRef,
    headerPanMomentumOffset: momentumScrollOffset,
  } = animatedHeaderBaseProps;

  useAnimatedReaction(
    () => momentumScrollOffset.get(),
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
          momentumScrollOffset.set(
            withDecay(
              {
                velocity: e.velocityY,
              },
              () => momentumScrollOffset.set(null)
            )
          );
        })
        .shouldCancelWhenOutside(false),
    // Note: In first testing Android works without gesture handler whatsoever. If this functionality is needed, we can further control it with a prop in the future
    [isPanEnabled, scrollToRef, momentumScrollOffset]
  );

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={pan}>
        <Animated.View style={[style, styles.container]} {...rest} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

// TODO: Lib refactor: context repetition, make people use less boilerplate by just wrapping the header with <HeaderBaseOrSomethingElse ctx={headerProps} /> that does everything under the hood (measuring total for example). That will then allow for people to use context inside
