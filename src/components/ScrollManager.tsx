import { useScrollManager, type UseScrollManagerOptions } from '../hooks';
import type { ScrollManagerConfig } from '../types';
import type { ReactNode } from 'react';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';

type ScrollManagerRenderChildren<TRef extends InstanceOrElement = any> = (
  scrollableProps: ScrollManagerConfig<TRef>['scrollableProps'],
  options: ScrollManagerConfig<TRef>['headerMotionContext']
) => ReactNode;

export interface HeaderMotionScrollManagerProps<
  TRef extends InstanceOrElement = any
> extends UseScrollManagerOptions<TRef> {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g., in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Render function that receives scroll props and header context.
   * Use this to create custom scroll implementations that integrate with HeaderMotion.
   */
  children: ScrollManagerRenderChildren<TRef>;
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
export function HeaderMotionScrollManager<
  TRef extends InstanceOrElement = any
>({
  children,
  scrollId,
  animatedRef,
  refreshControl,
  refreshing,
  onRefresh,
  progressViewOffset,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
}: HeaderMotionScrollManagerProps<TRef>) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.ScrollManager only accepts render function as the only child.'
    );
  }

  const { scrollableProps, headerMotionContext } = useScrollManager<TRef>(
    scrollId,
    {
      animatedRef,
      refreshControl,
      refreshing,
      onRefresh,
      progressViewOffset,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
    }
  );

  return children(scrollableProps, headerMotionContext);
}
