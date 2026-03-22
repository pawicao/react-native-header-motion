import Animated, {
  type AnimatedRef,
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import type { HeaderMotionOffsetProps } from '../types';
import { resolveHeaderOffsetStyle } from '../utils';
import { HeaderMotionScrollManager } from './ScrollManager';

export type HeaderMotionScrollViewProps = AnimatedScrollViewProps &
  HeaderMotionOffsetProps & {
    /**
     * Optional unique identifier for this scroll view.
     * Use this when you have multiple scroll views (e.g. in tabs) to track them separately.
     */
    scrollId?: string;
    /**
     * Optional animated ref to use for the scroll view.
     * When provided, the scroll manager will use this ref instead of creating its own.
     */
    animatedRef?: AnimatedRef<Animated.ScrollView> | AnimatedRef;
  };

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
export function HeaderMotionScrollView({
  scrollId,
  animatedRef,
  headerOffsetStrategy,
  children,
  contentContainerStyle,
  refreshControl,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  ...props
}: HeaderMotionScrollViewProps) {
  return (
    <HeaderMotionScrollManager
      scrollId={scrollId}
      animatedRef={animatedRef as AnimatedRef<Animated.ScrollView>}
      refreshControl={refreshControl}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      {(
        {
          onScroll: managedOnScroll,
          ref,
          refreshControl: managedRefreshControl,
          ...scrollViewProps
        },
        { originalHeaderHeight, minHeightContentContainerStyle }
      ) => (
        <Animated.ScrollView
          {...scrollViewProps}
          {...props}
          ref={ref}
          onScroll={managedOnScroll}
          {...(managedRefreshControl && {
            refreshControl: managedRefreshControl,
          })}
        >
          <Animated.View
            style={[
              minHeightContentContainerStyle,
              resolveHeaderOffsetStyle(
                originalHeaderHeight,
                headerOffsetStrategy
              ),
              contentContainerStyle,
            ]}
          >
            {children}
          </Animated.View>
        </Animated.ScrollView>
      )}
    </HeaderMotionScrollManager>
  );
}
