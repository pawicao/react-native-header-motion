import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
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
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <AsChildHeader />
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

function AsChildHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

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

  const dynamicStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const opacity = interpolate(
      progress.get(),
      [0, 0.65, 1],
      [1, 0.25, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        {
          translateY: interpolate(
            progress.get(),
            [0, 1],
            [0, threshold * 0.45],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <HeaderMotion.Header asChild>
      <Animated.View
        style={[
          styles.headerWrapper,
          styles.absoluteHeaderWrapper,
          { paddingTop: insets.top },
          containerStyle,
        ]}
      >
        <Animated.View style={titleStyle}>
          <TitleWithSubtitle
            title="asChild Header"
            subtitle="Measurement injected into your own elements"
          />
        </Animated.View>

        <View style={styles.dynamicContent}>
          <HeaderMotion.Header.Dynamic asChild>
            <Animated.View style={[styles.boxContainer, dynamicStyle]}>
              <DynamicBox />
              <DynamicBox />
            </Animated.View>
          </HeaderMotion.Header.Dynamic>
        </View>
      </Animated.View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#1D4ED8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.14)',
  },
  absoluteHeaderWrapper: {
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  dynamicContent: {
    overflow: 'hidden',
  },
  boxContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    alignItems: 'stretch',
  },
});

const content = generateContent({
  count: 120,
  backgroundColor: '#DBEAFE',
  textColor: '#1E3A8A',
});
