import { useMemo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
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

import type { MotionProgress } from '../types';

export type HeaderBaseProps = ViewProps;
export type AnimatedHeaderBaseProps = AnimatedProps<ViewProps> &
  Partial<
    Pick<
      MotionProgress,
      'scrollToRef' | 'enableHeaderPan' | 'headerPanMomentumOffset'
    >
  >;

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
// TODO: Intercept ongoing scroll when starting to pan (perhaps even on the tap itself but to be checked what feels better when using)
// TODO: May need to block momentum by forcing scrollTo
export function AnimatedHeaderBase({
  style,
  scrollToRef,
  enableHeaderPan = false,
  headerPanMomentumOffset,
  ...rest
}: AnimatedHeaderBaseProps) {
  const momentumScrollOffset = headerPanMomentumOffset;

  useAnimatedReaction(
    () => momentumScrollOffset?.get() ?? null,
    (offset, prevOffset) => {
      if (offset !== null) {
        const dy = offset - (prevOffset ?? 0);
        scrollToRef?.current?.(dy);
        // TODO: We gotta stop applying this as soon as the user starts scrolling by hand, otherwise we are stopping his scroll with our forced scrollTo
      }
    }
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enableHeaderPan)
        .onChange((e) => {
          const dy = e.changeY;
          scrollToRef?.current?.(dy);
        })
        // TODO: onEnd or onFinalize?
        .onEnd((e) => {
          if (!momentumScrollOffset) {
            return;
          }

          momentumScrollOffset.set(
            withDecay(
              {
                velocity: e.velocityY,
                // todo: some clamp?
              },
              () => momentumScrollOffset.set(null)
            )
          );
        })
        .shouldCancelWhenOutside(false),
    // TODO: Android seems to work without gesture handler at all? probably need a prop to control how it should behave and then we either block external gesture and let GH handle it fully OR disable this on android completely
    // .blocksExternalGesture(scrollRef), <-- maybe not needed
    [enableHeaderPan, scrollToRef, momentumScrollOffset]
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
