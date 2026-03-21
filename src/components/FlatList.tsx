import { forwardRef, type ComponentProps, type ComponentRef } from 'react';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

import type { ScrollViewProps } from 'react-native';

export type HeaderMotionFlatListProps<T = any> = ComponentProps<
  typeof Animated.FlatList<T>
> & {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g. in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Optional animated ref to use for the flat list.
   * When provided, the scroll manager will use this ref instead of creating its own.
   */
  animatedRef?: AnimatedRef<Animated.FlatList<T>> | AnimatedRef;
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
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  ...props
}: HeaderMotionFlatListProps<T>) {
  return (
    <HeaderMotionScrollManager
      scrollId={scrollId}
      animatedRef={animatedRef as AnimatedRef<Animated.FlatList<T>>}
      refreshControl={props.refreshControl}
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
      progressViewOffset={props.progressViewOffset}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      {(
        {
          onScroll: managedOnScroll,
          refreshControl: managedRefreshControl,
          ref,
          ...scrollViewProps
        },
        { originalHeaderHeight, minHeightContentContainerStyle }
      ) => (
        <Animated.FlatList
          {...scrollViewProps}
          {...props}
          ref={ref}
          onScroll={managedOnScroll}
          {...(managedRefreshControl && {
            refreshControl: managedRefreshControl,
          })}
          renderScrollComponent={(scrollComponentProps) => (
            <AnimatedScrollContainer
              {...scrollComponentProps}
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
