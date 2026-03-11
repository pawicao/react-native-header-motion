import {
  forwardRef,
  isValidElement,
  type ComponentProps,
  type ComponentRef,
  type ReactElement,
} from 'react';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

import type { RefreshControlProps, ScrollViewProps } from 'react-native';

type AnimatedFlatListProps<T = any> = Omit<
  ComponentProps<typeof Animated.FlatList<T>>,
  'refreshControl'
>;

export type HeaderMotionFlatListProps<T = any> = AnimatedFlatListProps<T> & {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g. in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Optional animated ref to use for the flat list.
   * When provided, the scroll manager will use this ref instead of creating its own.
   */
  animatedRef?: AnimatedRef<any>;
  refreshControl?: ReactElement<RefreshControlProps>;
  refreshing?: boolean;
  onRefresh?: () => void;
};

/**
 * Animated FlatList component that integrates with HeaderMotion.
 * Automatically handles scroll tracking and header animation synchronization.
 * Must be used within a HeaderMotion component.
 *
 * @template T - The type of items in the FlatList
 *
 * @example
 * ```tsx
 * <HeaderMotion>
 *   <HeaderMotion.FlatList
 *     data={items}
 *     renderItem={({ item }) => <Text>{item}</Text>}
 *   />
 * </HeaderMotion>
 * ```
 */
export function HeaderMotionFlatList<T = any>({
  scrollId,
  animatedRef,
  contentContainerStyle,
  refreshControl,
  refreshing,
  onRefresh,
  ...props
}: HeaderMotionFlatListProps<T>) {
  const explicitRefreshControl = isValidElement<RefreshControlProps>(
    refreshControl
  )
    ? refreshControl
    : undefined;

  return (
    <HeaderMotionScrollManager
      scrollId={scrollId}
      animatedRef={animatedRef}
      refreshControl={explicitRefreshControl}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {(
        { onScroll, refreshControl: managedRefreshControl, ...scrollViewProps },
        { originalHeaderHeight, minHeightContentContainerStyle }
      ) => (
        <Animated.FlatList
          {...scrollViewProps}
          {...props}
          onScroll={onScroll}
          refreshControl={managedRefreshControl}
          renderScrollComponent={(scrollComponentProps) => (
            <AnimatedScrollContainer
              {...scrollComponentProps}
              refreshControl={managedRefreshControl}
              contentContainerStyle={[
                minHeightContentContainerStyle,
                { paddingTop: originalHeaderHeight },
                contentContainerStyle,
              ]}
            />
          )}
        />
      )}
    </HeaderMotionScrollManager>
  );
}

const AnimatedScrollContainer = forwardRef<
  ComponentRef<typeof Animated.ScrollView>,
  ScrollViewProps
>(({ children, contentContainerStyle, ...rest }, ref) => {
  return (
    <Animated.ScrollView {...rest} ref={ref}>
      <Animated.View style={contentContainerStyle}>{children}</Animated.View>
    </Animated.ScrollView>
  );
});
