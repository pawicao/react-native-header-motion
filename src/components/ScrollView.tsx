import Animated, {
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

export type HeaderMotionScrollViewProps = AnimatedScrollViewProps & {
  scrollId?: string;
};

export function HeaderMotionScrollView({
  scrollId,
  children,
  contentContainerStyle,
  ...props
}: HeaderMotionScrollViewProps) {
  return (
    <HeaderMotionScrollManager scrollId={scrollId}>
      {(
        { onScroll, ...scrollViewProps },
        { originalHeaderHeight, minHeightContentContainerStyle }
      ) => (
        <Animated.ScrollView
          {...scrollViewProps}
          {...props}
          onScroll={onScroll}
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
