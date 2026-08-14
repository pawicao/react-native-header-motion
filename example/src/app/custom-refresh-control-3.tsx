import { StyleSheet, Text, View } from 'react-native';
import { useRefreshControl } from 'react-native-header-motion';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { RefreshShowcaseScreen } from '@/components/RefreshShowcaseScreen';

export default function Screen() {
  return (
    <RefreshShowcaseScreen
      title="Filling Header Meter"
      subtitle="Progress, threshold, shimmer"
      headerColor="#172554"
      contentBackgroundColor="#DBEAFE"
      contentTextColor="#172554"
    >
      <Meter />
    </RefreshShowcaseScreen>
  );
}

function Meter() {
  const refresh = useRefreshControl();
  const clock = useSharedValue(0);

  useFrameCallback((frame) => {
    if (refresh.isRefreshing.value) {
      clock.value += frame.timeSincePreviousFrame ?? 16;
    }
  });

  const fillStyle = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1);
    const backgroundColor = interpolateColor(p, [0, 1], ['#60A5FA', '#A7F3D0']);
    return {
      width: `${p * 100}%`,
      backgroundColor,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const active = refresh.isRefreshing.value ? 1 : 0;
    const x = ((clock.value / 900) % 1) * 220 - 70;
    return {
      opacity: active,
      transform: [{ translateX: x }],
    };
  });

  const markerStyle = useAnimatedStyle(() => {
    const ready = refresh.isReady.value || refresh.isRefreshing.value ? 1 : 0;
    return {
      opacity: interpolate(
        refresh.progress.value,
        [0.8, 1],
        [0.4, 1],
        Extrapolation.CLAMP
      ),
      transform: [{ scaleY: 1 + ready * 0.25 }],
    };
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.copyRow}>
        <Text style={styles.label}>Refresh charge</Text>
        <Text style={styles.value}>100%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
        <Animated.View style={[styles.marker, markerStyle]} />
      </View>
      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>idle</Text>
        <Text style={styles.scaleText}>ready</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: '#ECFDF5',
    fontSize: 18,
    fontWeight: '800',
  },
  track: {
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  shimmer: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    width: 48,
    backgroundColor: 'rgba(255,255,255,0.32)',
    transform: [{ rotate: '18deg' }],
  },
  marker: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: '72%',
    width: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleText: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 11,
    fontWeight: '700',
  },
});
