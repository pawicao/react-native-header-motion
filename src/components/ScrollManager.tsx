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
   * Unique identifier for this scrollable in multi-scroll setups.
   *
   * Omit it for single-scroll screens.
   */
  scrollId?: string;
  /**
   * Render function that receives:
   * - the props to spread onto your scrollable
   * - the layout values needed to offset content below the header
   */
  children: ScrollManagerRenderChildren<TRef>;
}

/**
 * Render-prop wrapper around `useScrollManager()`.
 *
 * **Most code should prefer `createHeaderMotionScrollable()` instead.**
 *
 * Use `ScrollManager` only when the factory approach is not enough and you
 * still need HeaderMotion to manage a custom scrollable through render-prop
 * composition.
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
export function ScrollManager<TRef extends InstanceOrElement = any>({
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
