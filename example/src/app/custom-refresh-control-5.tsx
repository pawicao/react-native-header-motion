import { StyleSheet, Text, View } from 'react-native';
import { useRefreshControl } from 'react-native-header-motion';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { RefreshShowcaseScreen } from '@/components/RefreshShowcaseScreen';

export default function Screen() {
  return (
    <RefreshShowcaseScreen
      title="Layered Parallax Header"
      subtitle="Refresh depth inside the header"
      headerColor="#263238"
      contentBackgroundColor="#D7CCC8"
      contentTextColor="#263238"
    >
      <ParallaxLayers />
    </RefreshShowcaseScreen>
  );
}

function ParallaxLayers() {
  return (
    <View style={styles.stage}>
      <Layer index={0} label="data" color="#FDE68A" />
      <Layer index={1} label="cache" color="#A7F3D0" />
      <Layer index={2} label="sync" color="#BFDBFE" />
      <Layer index={3} label="done" color="#FECACA" />
    </View>
  );
}

function Layer({
  index,
  label,
  color,
}: {
  index: number;
  label: string;
  color: string;
}) {
  const refresh = useRefreshControl();

  const style = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1.35);
    const depth = index + 1;
    const translateY = interpolate(
      p,
      [0, 1, 1.35],
      [18 + index * 7, -depth * 9, -depth * 14],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      p,
      [0, 1],
      [(index - 1.5) * 10, (index - 1.5) * 26],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      p,
      [0, 0.35, 1],
      [0, 0.72, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { scale: interpolate(p, [0, 1], [0.92, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.layer, { backgroundColor: color }, style]}>
      <Text style={styles.layerText}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  layer: {
    position: 'absolute',
    width: 108,
    height: 48,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  layerText: {
    color: '#263238',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
