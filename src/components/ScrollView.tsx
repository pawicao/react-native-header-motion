import type { ComponentProps } from 'react';
import Animated from 'react-native-reanimated';
import {
  createHeaderMotionScrollableComponent,
  type HeaderMotionScrollableOwnProps,
} from './createHeaderMotionScrollableComponent';

export type HeaderMotionScrollViewProps = ComponentProps<
  typeof Animated.ScrollView
> &
  HeaderMotionScrollableOwnProps<Animated.ScrollView>;

export const HeaderMotionScrollView = createHeaderMotionScrollableComponent(
  Animated.ScrollView,
  {
    displayName: 'HeaderMotion.ScrollView',
    componentAnimation: 'assume-animated',
  }
);

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
