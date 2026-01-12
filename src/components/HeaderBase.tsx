import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

export type HeaderBaseProps = ViewProps;
export type AnimatedHeaderBaseProps = AnimatedProps<ViewProps>;

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
export function AnimatedHeaderBase({
  style,
  ...rest
}: AnimatedHeaderBaseProps) {
  return <Animated.View style={[style, styles.container]} {...rest} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
