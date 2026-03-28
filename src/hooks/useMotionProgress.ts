import { useContext } from 'react';
import { HeaderMotionContext } from '../context';
import type { MotionProgress } from '../types';

/**
 * Hook to access motion progress values and measuring functions for header animations.
 * Returns the progress value (0-1), threshold, and measurement functions.
 *
 * Must be used within a {@link HeaderMotion} component.
 *
 * @returns Motion progress values and measuring functions:
 * - `progress`: Shared value from 0 to 1
 * - `progressThreshold`: The threshold at which animation completes
 * - `measureTotalHeight`: Function to measure total header height. Should be passed to the `onLayout` prop of the base of a header, to let scrollables account for the total header height
 * - `measureDynamic`: Function to measure a dimension of choice of the animated element of the header - should be passed to the `onLayout` prop of such. If used, can be used for dynamic calculation of the {@link progressThreshold}.
 *
 * @throws Error if used outside of a {@link HeaderMotion} component
 *
 * @example
 * ```tsx
 * function MyHeader() {
 *   const { progress, progressThreshold, measureTotalHeight, measureDynamic } = useMotionProgress();
 *   const dynamicStyle = useAnimatedStyle(() => {
 *     const translateY = interpolate(
 *       progress.value,
 *       [0, 1],
 *       [0, -progressThreshold.get()],
 *       Extrapolation.CLAMP,
 *     )
 *     return { transform: [{ translateY }] }
 *   })
 *   return (
 *     <AnimatedHeaderBase onLayout={measureTotalHeight}>
 *       <Animated.View onLayout={measureDynamic} style={dynamicStyle} />
 *     </AnimatedHeaderBase>
 *   )
 * }
 * ```
 */
export function useMotionProgress(): MotionProgress {
  const ctxValue = useContext(HeaderMotionContext);
  if (!ctxValue) {
    throw new Error(
      'useMotionProgress must be used within a <HeaderMotion /> component. If using inside a navigation header, consider using <HeaderMotion.Header /> instead to ensure context access.'
    );
  }
  const {
    progress,
    measureTotalHeight,
    measureDynamic,
    progressThreshold,
    animatedHeaderBaseProps,
    activeScrollId,
  } = ctxValue;

  return {
    progress,
    measureTotalHeight,
    measureDynamic,
    progressThreshold,
    animatedHeaderBaseProps,
    activeScrollId,
  };
}
