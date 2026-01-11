import { forwardRef, type ComponentProps, type ComponentRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

type AnimatedFlatListProps<T = any> = ComponentProps<
  typeof Animated.FlatList<T>
>;

export type HeaderMotionFlatListProps<T = any> = AnimatedFlatListProps<T> & {
  scrollId?: string;
};

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
          renderScrollComponent={(propsz) => (
            <AnimatedScrollContainer {...propsz} />
          )}
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

const AnimatedScrollContainer = forwardRef<
  ComponentRef<typeof ScrollView>,
  ScrollViewProps
>(({ children, contentContainerStyle, ...rest }, ref) => {
  return (
    <ScrollView {...rest} ref={ref}>
      <Animated.View style={contentContainerStyle}>{children}</Animated.View>
    </ScrollView>
  );
});
