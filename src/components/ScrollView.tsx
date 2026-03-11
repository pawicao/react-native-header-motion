import type { ReactElement } from 'react';
import type { RefreshControlProps } from 'react-native';
import Animated, {
  type AnimatedRef,
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

export type HeaderMotionScrollViewProps = Omit<
  AnimatedScrollViewProps,
  'refreshControl'
> & {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g. in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Optional animated ref to use for the scroll view.
   * When provided, the scroll manager will use this ref instead of creating its own.
   */
  animatedRef?: AnimatedRef<any>;
  refreshControl?: ReactElement<RefreshControlProps>;
  refreshing?: boolean;
  onRefresh?: () => void;
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
  children,
  contentContainerStyle,
  refreshControl,
  refreshing,
  onRefresh,
  ...props
}: HeaderMotionScrollViewProps) {
  return (
    <HeaderMotionScrollManager
      scrollId={scrollId}
      animatedRef={animatedRef}
      refreshControl={refreshControl}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {(
        { onScroll, refreshControl: managedRefreshControl, ...scrollViewProps },
        { originalHeaderHeight, minHeightContentContainerStyle }
      ) => (
        <Animated.ScrollView
          {...scrollViewProps}
          {...props}
          onScroll={onScroll}
          refreshControl={managedRefreshControl}
        >
          <Animated.View
            style={[
              minHeightContentContainerStyle,
              { paddingTop: originalHeaderHeight },
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
