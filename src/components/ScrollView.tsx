import Animated, {
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import { HeaderMotionScrollManager } from './ScrollManager';

export type HeaderMotionScrollViewProps = AnimatedScrollViewProps & {
  scrollId?: string;
};

export function HeaderMotionScrollView({
  scrollId,
  ...props
}: HeaderMotionScrollViewProps) {
  return (
    <HeaderMotionScrollManager scrollId={scrollId}>
      {({ onScroll, ...scrollViewProps }, { originalHeaderHeight }) => (
        <Animated.ScrollView
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
