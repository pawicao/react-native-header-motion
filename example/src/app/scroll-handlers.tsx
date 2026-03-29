import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { useCallback } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
  const scrollHandlers = useScrollHandlerLoggers();

  return (
    <HeaderMotion>
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
      <HeaderMotion.ScrollView {...scrollHandlers}>
        {content}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function useScrollHandlerLoggers() {
  const prefix = '[HeaderMotion.ScrollView consumer]';

  return {
    onScrollBeginDrag: useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        console.log(prefix, 'onScrollBeginDrag', {
          y: e.nativeEvent.contentOffset.y,
        });
      },
      []
    ),
    onScrollEndDrag: useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        console.log(prefix, 'onScrollEndDrag', {
          y: e.nativeEvent.contentOffset.y,
        });
      },
      []
    ),
    onMomentumScrollBegin: useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        console.log(prefix, 'onMomentumScrollBegin', {
          y: e.nativeEvent.contentOffset.y,
        });
      },
      []
    ),
    onMomentumScrollEnd: useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        console.log(prefix, 'onMomentumScrollEnd', {
          y: e.nativeEvent.contentOffset.y,
        });
      },
      []
    ),
    onContentSizeChange: useCallback((w: number, h: number) => {
      console.log(prefix, 'onContentSizeChange', { width: w, height: h });
    }, []),
    onScroll: useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
      console.log(prefix, 'onScroll', {
        y: e.nativeEvent.contentOffset.y,
      });
    }, []),
  };
}

function CollapsibleHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const boxSectionStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const parallaxTranslateY = interpolate(
      progress.value,
      [0, 1],
      [0, threshold * 0.5],
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
    <HeaderMotion.Header
      style={[styles.headerWrapper, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={[titleStyle]}>
        <TitleWithSubtitle
          title="Scroll handlers"
          subtitle="Console logging probe"
        />
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
  hint: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    color: '#304077',
    opacity: 0.9,
  },
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
  count: 80,
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
  label: 'Scroll row',
});
