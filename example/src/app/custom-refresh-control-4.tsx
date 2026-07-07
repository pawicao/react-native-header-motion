import { StyleSheet, Text, View } from 'react-native';
import { useRefreshControl } from 'react-native-header-motion';
import Animated, {
  type DerivedValue,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { RefreshShowcaseScreen } from '@/components/RefreshShowcaseScreen';

export default function Screen() {
  return (
    <RefreshShowcaseScreen
      title="Morphing Refresh Badge"
      subtitle="Status pill from shared values"
      headerColor="#0F172A"
      contentBackgroundColor="#E2E8F0"
      contentTextColor="#0F172A"
    >
      <Badge />
    </RefreshShowcaseScreen>
  );
}

function Badge() {
  const refresh = useRefreshControl();

  const pillStyle = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1.2);
    const width = interpolate(p, [0, 1], [44, 210], Extrapolation.CLAMP);
    const backgroundColor = interpolateColor(
      p,
      [0, 1],
      ['rgba(148,163,184,0.24)', 'rgba(45,212,191,0.92)']
    );
    return {
      width,
      backgroundColor,
      transform: [
        { scale: interpolate(p, [0, 1.2], [0.88, 1.04], Extrapolation.CLAMP) },
      ],
    };
  });

  const dotStyle = useAnimatedStyle(() => {
    const p = Math.min(refresh.progress.value, 1);
    return {
      opacity: interpolate(p, [0, 0.25], [0.2, 1], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(p, [0, 1], [0.65, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  const pullTextStyle = useStatusOpacity(refresh.isPulling);
  const readyTextStyle = useStatusOpacity(refresh.isReady);
  const refreshingTextStyle = useStatusOpacity(refresh.isRefreshing);
  const settlingTextStyle = useStatusOpacity(refresh.isSettling);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.pill, pillStyle]}>
        <Animated.View style={[styles.dot, dotStyle]} />
        <View style={styles.textStack}>
          <Animated.Text style={[styles.text, pullTextStyle]}>
            Pull to build
          </Animated.Text>
          <Animated.Text style={[styles.text, readyTextStyle]}>
            Release to run
          </Animated.Text>
          <Animated.Text style={[styles.text, refreshingTextStyle]}>
            Refreshing
          </Animated.Text>
          <Animated.Text style={[styles.text, settlingTextStyle]}>
            Settling
          </Animated.Text>
        </View>
      </Animated.View>
      <Text style={styles.caption}>
        A single progress value drives the badge.
      </Text>
    </View>
  );
}

function useStatusOpacity(value: DerivedValue<boolean>) {
  return useAnimatedStyle(() => ({
    opacity: value.value ? 1 : 0,
  }));
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  pill: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  textStack: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    color: '#042F2E',
    fontWeight: '800',
    fontSize: 14,
  },
  caption: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    fontWeight: '600',
  },
});
