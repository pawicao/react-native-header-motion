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
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
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
      <HeaderMotion.ScrollView>{content}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function CollapsibleHeader({
  progress,
  measureTotal,
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
      onLayout={measureTotal}
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

const content = generateContent({
  count: 500,
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
});
