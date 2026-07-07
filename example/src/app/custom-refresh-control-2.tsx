import { StyleSheet, Text, View } from 'react-native';
import { useRefreshControl } from 'react-native-header-motion';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { RefreshShowcaseScreen } from '@/components/RefreshShowcaseScreen';

const COMMANDS = ['Sync', 'Cache', 'Render'];

export default function Screen() {
  return (
    <RefreshShowcaseScreen
      title="Elastic Command Header"
      subtitle="Tiles respond to pull progress"
      headerColor="#12312F"
      contentBackgroundColor="#D1FAE5"
      contentTextColor="#12312F"
    >
      <CommandTiles />
    </RefreshShowcaseScreen>
  );
}

function CommandTiles() {
  const clock = useSharedValue(0);
  const refresh = useRefreshControl();

  useFrameCallback((frame) => {
    if (refresh.isRefreshing.value) {
      clock.value += frame.timeSincePreviousFrame ?? 16;
    }
  });

  return (
    <View style={styles.tileRow}>
      {COMMANDS.map((label, index) => (
        <CommandTile key={label} index={index} label={label} clock={clock} />
      ))}
    </View>
  );
}

function CommandTile({
  index,
  label,
  clock,
}: {
  index: number;
  label: string;
  clock: Animated.SharedValue<number>;
}) {
  const refresh = useRefreshControl();

  const tileStyle = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1.35);
    const overshoot = Math.min(refresh.overshoot.value, 0.7);
    const side = index - 1;
    const pulse = refresh.isRefreshing.value
      ? Math.sin(clock.value / 180 + index * 1.4) * 5
      : 0;

    return {
      opacity: interpolate(p, [0, 0.25, 1], [0, 0.65, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateX:
            side * interpolate(p, [0, 1], [0, 22], Extrapolation.CLAMP),
        },
        {
          translateY:
            interpolate(p, [0, 1], [18, -8], Extrapolation.CLAMP) + pulse,
        },
        {
          scale:
            interpolate(p, [0, 1], [0.86, 1], Extrapolation.CLAMP) +
            overshoot * 0.12,
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.tile, tileStyle]}>
      <View style={styles.tileGlyph} />
      <Text style={styles.tileText}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tile: {
    width: 92,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tileGlyph: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6EE7B7',
  },
  tileText: {
    color: '#ECFDF5',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
