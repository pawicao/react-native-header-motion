import { useScrollManager } from '../hooks';
import type { ScrollManagerConfig } from '../types';
import type { ResolveRefreshControlOptions } from '../hooks/refreshControl';
import type { ReactNode } from 'react';
import type { AnimatedRef } from 'react-native-reanimated';

type ScrollManagerRenderChildren = (
  scrollableProps: ScrollManagerConfig['scrollableProps'],
  options: ScrollManagerConfig['headerMotionContext']
) => ReactNode;

export interface HeaderMotionScrollManagerProps
  extends Omit<ResolveRefreshControlOptions, 'progressViewOffset'> {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g., in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Optional animated ref to use for the scroll view.
   * When provided, the scroll manager will use this ref instead of creating its own.
   */
  animatedRef?: AnimatedRef<any>;
  /**
   * Optional refresh progress offset override.
   * When provided, it takes precedence over the automatic offset based on header height.
   */
  progressViewOffset?: ResolveRefreshControlOptions['progressViewOffset'];
  /**
   * Render function that receives scroll props and header context.
   * Use this to create custom scroll implementations that integrate with HeaderMotion.
   */
  children: ScrollManagerRenderChildren;
}

/**
 * ScrollManager component that provides scroll tracking functionality for custom scroll implementations. Uses {@link useScrollManager} under the hood.
 * Must be used within a HeaderMotion component.
 *
 * This is useful when you need to use a scroll component that isn't directly supported
 * (like a custom scroll view or third-party list components).
 *
 * @example
 * ```tsx
 * <HeaderMotion>
 *   <HeaderMotion.ScrollManager>
 *     {(scrollableProps, { originalHeaderHeight }) => (
 *       <CustomScrollView {...scrollableProps}>
 *         <View style={{ paddingTop: originalHeaderHeight }}>
 *           <Text>Content</Text>
 *         </View>
 *       </CustomScrollView>
 *     )}
 *   </HeaderMotion.ScrollManager>
 * </HeaderMotion>
 * ```
 */
export function HeaderMotionScrollManager({
  children,
  scrollId,
  animatedRef,
  refreshControl,
  refreshing,
  onRefresh,
  progressViewOffset,
}: HeaderMotionScrollManagerProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.ScrollManager only accepts render function as the only child.'
    );
  }

  const { scrollableProps, headerMotionContext } = useScrollManager(scrollId, {
    animatedRef,
    refreshControl,
    refreshing,
    onRefresh,
    progressViewOffset,
  });

  return children(scrollableProps, headerMotionContext);
}
