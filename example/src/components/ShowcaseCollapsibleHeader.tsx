import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DynamicBox } from './DynamicBox';
import { TitleWithSubtitle } from './TitleWithSubtitle';

interface ShowcaseCollapsibleHeaderProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
}

export function ShowcaseCollapsibleHeader({
  title,
  subtitle,
  backgroundColor,
}: ShowcaseCollapsibleHeaderProps) {
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
      [0, 0.6],
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
      style={[
        styles.headerWrapper,
        { backgroundColor, paddingTop: insets.top },
        containerStyle,
      ]}
    >
      <Animated.View style={titleStyle}>
        <TitleWithSubtitle title={title} subtitle={subtitle} />
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
