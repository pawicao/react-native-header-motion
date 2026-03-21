import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import HeaderMotion, {
  AnimatedHeaderBase,
  type WithCollapsibleHeaderProps,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
  const onScroll = useAnimatedScrollHandler({
    onScroll: () => {
      'worklet';
      console.log('consumer onScroll');
    },
  });

  return (
    <HeaderMotion>
      <HeaderMotion.Header>
        {(headerProps) => (
          <Stack.Screen
            options={{
              header: () => <CollapsibleHeader {...headerProps} />,
            }}
          />
        )}
      </HeaderMotion.Header>
      <HeaderMotion.ScrollView onScroll={onScroll}>
        {content}
      </HeaderMotion.ScrollView>
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

  const containerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -progressThreshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, progressThreshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

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
        <TitleWithSubtitle
          title="Scroll handlers"
          subtitle="Console logging probe"
        />
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
  hint: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    color: '#304077',
    opacity: 0.9,
  },
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

const content = generateContent({
  count: 80,
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
  label: 'Scroll row',
});
