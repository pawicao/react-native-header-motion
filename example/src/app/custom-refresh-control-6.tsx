import { StyleSheet, View } from 'react-native';
import { useRefreshControl } from 'react-native-header-motion';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { RefreshShowcaseScreen } from '@/components/RefreshShowcaseScreen';

const TICKS = Array.from({ length: 24 }, (_, index) => index);

export default function Screen() {
  return (
    <RefreshShowcaseScreen
      title="Circular Progress Dial"
      subtitle="View-based dial, no SVG"
      headerColor="#3B0764"
      contentBackgroundColor="#F3E8FF"
      contentTextColor="#3B0764"
    >
      <Dial />
    </RefreshShowcaseScreen>
  );
}

function Dial() {
  const refresh = useRefreshControl();
  const clock = useSharedValue(0);

  useFrameCallback((frame) => {
    if (refresh.isRefreshing.value) {
      clock.value += frame.timeSincePreviousFrame ?? 16;
    }
  });

  const ringStyle = useAnimatedStyle(() => {
    const rotate = refresh.isRefreshing.value
      ? (clock.value / 8) % 360
      : interpolate(
          refresh.progress.value,
          [0, 1],
          [0, 180],
          Extrapolation.CLAMP
        );
    return { transform: [{ rotate: `${rotate}deg` }] };
  });

  const coreStyle = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1.25);
    return {
      opacity: interpolate(p, [0, 0.2], [0, 1], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(p, [0, 1.25], [0.7, 1.08], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.ring, ringStyle]}>
        {TICKS.map((tick) => (
          <Tick key={tick} index={tick} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.core, coreStyle]} />
    </View>
  );
}

function Tick({ index }: { index: number }) {
  const refresh = useRefreshControl();
  const angle = (360 / TICKS.length) * index;

  const style = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1);
    const lit = p * TICKS.length >= index ? 1 : 0.18;
    return {
      opacity: interpolate(p, [0, 1], [0.18, lit], Extrapolation.CLAMP),
      transform: [
        { rotate: `${angle}deg` },
        { translateY: -42 },
        { scaleY: interpolate(p, [0, 1], [0.7, 1.25], Extrapolation.CLAMP) },
      ],
    };
  });

  return <Animated.View style={[styles.tick, style]} />;
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    position: 'absolute',
    width: 5,
    height: 20,
    borderRadius: 3,
    backgroundColor: '#FDE68A',
  },
  core: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C084FC',
    borderWidth: 8,
    borderColor: '#F5D0FE',
  },
});
