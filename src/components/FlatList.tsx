import { forwardRef, type ComponentProps, type ComponentRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

type AnimatedFlatListProps<T = any> = ComponentProps<
  typeof Animated.FlatList<T>
>;

export type HeaderMotionFlatListProps<T = any> = AnimatedFlatListProps<T> & {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g. in tabs) to track them separately.
   */
  scrollId?: string;
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
  ...props
}: HeaderMotionFlatListProps<T>) {
  return (
    <HeaderMotionScrollManager scrollId={scrollId}>
      {(
        { onScroll, ...scrollViewProps },
        { originalHeaderHeight, minHeightContentContainerStyle }
      ) => (
        <Animated.FlatList
          {...scrollViewProps}
          {...props}
          onScroll={onScroll}
          renderScrollComponent={renderScrollComponent}
          contentContainerStyle={[
            minHeightContentContainerStyle,
            { paddingTop: originalHeaderHeight },
            props.contentContainerStyle,
          ]}
        />
      )}
    </HeaderMotionScrollManager>
  );
}

export const renderScrollComponent = (propsz: ScrollViewProps) => (
  <AnimatedScrollContainer {...propsz} />
);

const AnimatedScrollContainer = forwardRef<
  ComponentRef<typeof ScrollView>,
  ScrollViewProps
>(({ children, contentContainerStyle, ...rest }, ref) => {
  console.log({ contentContainerStyle });
  return (
    <ScrollView {...rest} ref={ref}>
      <Animated.View style={contentContainerStyle}>{children}</Animated.View>
    </ScrollView>
  );
});
