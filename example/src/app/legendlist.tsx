import { ContentCard, DynamicBox, TitleWithSubtitle } from '@/components';
import HeaderMotion, {
  AnimatedHeaderBase,
  type WithCollapsibleHeaderProps,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { renderScrollComponent } from '../../../src/components';
import { FlashList } from '@shopify/flash-list';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
export default function Screen() {
  return (
    <HeaderMotion measureDynamicMode="update">
      <HeaderMotion.Header>
        {(headerProps) => (
          <Stack.Screen
            options={{
              header: () => <CollapsibleHeader {...headerProps} />,
            }}
          />
        )}
      </HeaderMotion.Header>
      <HeaderMotion.ScrollManager>
        {(props, { originalHeaderHeight, minHeightContentContainerStyle }) => (
          <AnimatedLegendList
            {...props}
            data={content}
            keyExtractor={(item) => `${item.index}`}
            renderItem={({ item }) => {
              console.log({
                originalHeaderHeight,
                minHeightContentContainerStyle,
              });
              return <ContentCard index={item.index} label={item.label} />;
            }}
            contentContainerStyle={[
              // minHeightContentContainerStyle,
              { marginTop: 178 },
            ]}
            renderScrollComponent={renderScrollComponent}
          />
        )}
      </HeaderMotion.ScrollManager>
    </HeaderMotion>
  );
}

function CollapsibleHeader({
  progress,
  measureTotalHeight,
  measureDynamic,
  progressThreshold,
}: WithCollapsibleHeaderProps) {
  const insets = useSafeAreaInsets();

  // 1. Container Animation (Moves UP)
  const containerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -progressThreshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 2. Title Animation (Counter-Moves DOWN to stay sticky)
  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, progressThreshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 3. Content Animation (Parallax + Opacity + Scale)
  const boxSectionStyle = useAnimatedStyle(() => {
    const parallaxTranslateY = interpolate(
      progress.value,
      [0, 1],
      [0, progressThreshold * 0.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      progress.value,
      [0, 1 * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: parallaxTranslateY }, { scale }],
    };
  });

  return (
    <AnimatedHeaderBase
      onLayout={measureTotalHeight}
      style={[styles.headerWrapper, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={[titleStyle]}>
        <TitleWithSubtitle title="Title" subtitle="Subtitle" />
      </Animated.View>

      <View style={styles.dynamicContent}>
        <Animated.View
          style={[styles.boxContainer, boxSectionStyle]}
          onLayout={measureDynamic}
        >
          <DynamicBox />
          <DynamicBox />
        </Animated.View>
      </View>
    </AnimatedHeaderBase>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#304077',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dynamicContent: {
    overflow: 'hidden',
  },
  boxContainer: {
    flexDirection: 'row',
    gap: 6,
    padding: 12,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
});

const content = Array.from({ length: 500 }, (_, k) => ({
  index: k + 1,
  label: 'LegendList Item',
}));
