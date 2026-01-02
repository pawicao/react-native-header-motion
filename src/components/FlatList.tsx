import type { ComponentProps } from 'react';
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
      {({ onScroll, ...scrollViewProps }, { originalHeaderHeight }) => (
        <Animated.FlatList
          {...scrollViewProps}
          {...props}
          onScroll={onScroll}
          contentContainerStyle={[
            { paddingTop: originalHeaderHeight },
            props.contentContainerStyle,
          ]}
        />
      )}
    </HeaderMotionScrollManager>
  );
}
