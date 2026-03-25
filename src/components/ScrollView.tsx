import type { ComponentProps } from 'react';
import Animated from 'react-native-reanimated';
import {
  createHeaderMotionScrollable,
  type HeaderMotionScrollableOwnProps,
} from './createHeaderMotionScrollable';

export type HeaderMotionScrollViewProps = ComponentProps<
  typeof Animated.ScrollView
> &
  HeaderMotionScrollableOwnProps<Animated.ScrollView>;

/**
 * Animated ScrollView component that integrates with HeaderMotion.
 * Automatically handles scroll tracking and header animation synchronization.
 * Must be used within a HeaderMotion component.
 *
 * @example
 * ```tsx
 * <HeaderMotion>
 *   <HeaderMotion.ScrollView>
 *     <MyScrollableContent />
 *   </HeaderMotion.ScrollView>
 * </HeaderMotion>
 * ```
 */
export const HeaderMotionScrollView = createHeaderMotionScrollable(
  Animated.ScrollView,
  {
    displayName: 'HeaderMotion.ScrollView',
    contentContainerMode: 'children',
    isComponentAnimated: true,
  }
);
