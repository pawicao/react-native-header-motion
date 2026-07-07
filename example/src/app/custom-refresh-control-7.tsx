import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRefreshControl } from 'react-native-header-motion';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { RefreshShowcaseScreen } from '@/components/RefreshShowcaseScreen';

const BAR_COUNT = 20;
const BARS = Array.from({ length: BAR_COUNT }, (_, index) => index);

export default function Screen() {
  return (
    <RefreshShowcaseScreen
      title="Refresh Equalizer"
      subtitle="Center-weighted bars"
      headerColor="#111827"
      contentBackgroundColor="#E0F2FE"
      contentTextColor="#0F172A"
    >
      <Equalizer />
    </RefreshShowcaseScreen>
  );
}

function Equalizer() {
  const { width } = useWindowDimensions();
  const barWidth = width / BAR_COUNT;

  return (
    <View style={styles.stage}>
      {BARS.map((index) => (
        <Bar key={index} index={index} width={barWidth} />
      ))}
    </View>
  );
}

function Bar({ index, width }: { index: number; width: number }) {
  const refresh = useRefreshControl();
  const clock = useSharedValue(0);
  const center = (BAR_COUNT - 1) / 2;
  const centerWeight = 1 - Math.abs(index - center) / center;
  const phase = index * 1.73;
  const speed = 0.006 + index * 0.00023;

  useFrameCallback((frame) => {
    if (refresh.isRefreshing.value) {
      clock.value += frame.timeSincePreviousFrame ?? 16;
    }
  });

  const style = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1);
    const wave = Math.sin(clock.value * speed + phase);
    const refreshing = refresh.isRefreshing.value ? 1 : 0;
    const pullOpacity = interpolate(
      p,
      [0, 1],
      [0, 0.18 + centerWeight * 0.68],
      Extrapolation.CLAMP
    );
    const activeOpacity = 0.35 + centerWeight * 0.45;
    const pullLift = interpolate(
      p,
      [0, 1],
      [30, -8 - centerWeight * 24],
      Extrapolation.CLAMP
    );
    const activeLift = wave * (12 + centerWeight * 34);
    const scaleY = refreshing
      ? 0.45 + ((wave + 1) / 2) * (0.75 + centerWeight * 0.8)
      : interpolate(
          p,
          [0, 1],
          [0.12, 0.55 + centerWeight * 0.65],
          Extrapolation.CLAMP
        );

    return {
      opacity: refreshing ? activeOpacity : pullOpacity,
      transform: [
        { translateY: refreshing ? activeLift : pullLift },
        { scaleY },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          left: index * width,
          width,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  stage: {
    position: 'absolute',
    left: -14,
    right: -14,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#38BDF8',
  },
});
