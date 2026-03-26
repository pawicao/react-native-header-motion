import type { ReactElement } from 'react';
import Animated, {
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import {
  createHeaderMotionScrollable,
  type HeaderMotionScrollableOwnProps,
} from './createHeaderMotionScrollable';

export type HeaderMotionScrollViewProps = AnimatedScrollViewProps &
  HeaderMotionScrollableOwnProps<Animated.ScrollView>;

type HeaderMotionScrollViewComponent = (
  props: HeaderMotionScrollViewProps
) => ReactElement | null;

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
) as HeaderMotionScrollViewComponent;
