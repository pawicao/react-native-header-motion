import { DynamicBox, generateContent, TitleWithSubtitle } from '@/components';
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BACKGROUND_IMAGE = 'https://picsum.photos/800/400';
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Screen() {
  return (
    <HeaderMotion
      progressExtrapolation={{
        extrapolateLeft: Extrapolation.EXTEND,
        extrapolateRight: Extrapolation.CLAMP,
      }}
    >
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <CollapsibleHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <HeaderMotion.ScrollView>{content}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function CollapsibleHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  // 1. Container Animation (Moves UP)
  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 2. Title Animation (Counter-Moves DOWN to stay sticky)
  const titleStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 3. Image Animation (Scale)
  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.get(), [-1, 0, 1], [1.5, 1.2, 1]);
    return { transform: [{ scale }] };
  });

  // 4. Content Animation (Parallax + Opacity + Scale)
  const boxSectionStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const parallaxTranslateY = interpolate(
      progress.get(),
      [0, 1],
      [0, threshold * 0.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      progress.get(),
      [0, 1 * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      progress.get(),
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
    <HeaderMotion.Header
      style={[styles.headerWrapper, { paddingTop: insets.top }, containerStyle]}
    >
      <AnimatedImage
        style={[styles.image, imageStyle]}
        source={{ uri: BACKGROUND_IMAGE }}
      />
      <Animated.View style={[titleStyle]}>
        <TitleWithSubtitle title="Title" subtitle="Subtitle" />
      </Animated.View>

      <View style={styles.dynamicContent}>
        <HeaderMotion.Header.Dynamic
          style={[styles.boxContainer, boxSectionStyle]}
        >
          <DynamicBox />
          <DynamicBox />
        </HeaderMotion.Header.Dynamic>
      </View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
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
  image: {
    inset: 0,
    position: 'absolute',
  },
});

const content = generateContent({
  count: 500,
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
});
