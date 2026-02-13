import {
  DynamicBox,
  TabButton,
  TitleWithSubtitle,
  generateContent,
} from '@/components';
import HeaderMotion, {
  AnimatedHeaderBase,
  useActiveScrollId,
  type WithCollapsiblePagedHeaderProps,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const indexToKey = new Map([
  [0, 'A'],
  [1, 'B'],
]);
const keyToIndex = new Map([
  ['A', 0],
  ['B', 1],
]);

export default function Screen() {
  const [activeScrollId, setActiveScrollId] = useActiveScrollId<string>('A');
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = (key: string) => {
    pagerRef.current?.setPage(keyToIndex.get(key)!);
  };

  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setActiveScrollId(indexToKey.get(e.nativeEvent.position)!);
  };

  return (
    <HeaderMotion activeScrollId={activeScrollId.sv}>
      <HeaderMotion.Header>
        {(headerProps) => (
          <Stack.Screen
            options={{
              header: () => (
                <CollapsibleHeader
                  {...headerProps}
                  activeTab={activeScrollId.state}
                  onTabChange={handleTabPress}
                />
              ),
            }}
          />
        )}
      </HeaderMotion.Header>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        <View key="A">
          <HeaderMotion.ScrollManager scrollId="A">
            {(scrollViewProps, { originalHeaderHeight }) => (
              <Animated.ScrollView {...scrollViewProps}>
                <Animated.View style={{ paddingTop: originalHeaderHeight }}>
                  {content}
                </Animated.View>
              </Animated.ScrollView>
            )}
          </HeaderMotion.ScrollManager>
        </View>
        <View key="B">
          <HeaderMotion.ScrollManager scrollId="B">
            {(scrollViewProps, { originalHeaderHeight }) => (
              <Animated.ScrollView {...scrollViewProps}>
                <Animated.View style={{ paddingTop: originalHeaderHeight }}>
                  {content}
                </Animated.View>
              </Animated.ScrollView>
            )}
          </HeaderMotion.ScrollManager>
        </View>
      </PagerView>
    </HeaderMotion>
  );
}

function CollapsibleHeader({
  progress,
  measureTotalHeight,
  measureDynamic,
  progressThreshold,
  activeTab,
  onTabChange,
}: WithCollapsiblePagedHeaderProps) {
  const insets = useSafeAreaInsets();

  // 1. Container Animation (Moves UP)
  const containerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -progressThreshold.value],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 2. Title Animation (Counter-Moves DOWN to stay sticky)
  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, progressThreshold.value],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  // 3. Content Animation (Parallax + Opacity + Scale)
  const boxSectionStyle = useAnimatedStyle(() => {
    const parallaxTranslateY = interpolate(
      progress.value,
      [0, 1],
      [0, progressThreshold.value * 0.5],
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
    <AnimatedHeaderBase
      onLayout={measureTotalHeight}
      style={[styles.headerWrapper, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={[titleStyle]}>
        <TitleWithSubtitle title="Title" subtitle="Subtitle" />
      </Animated.View>

      <View style={styles.dynamicContent}>
        <Animated.View
          style={[styles.boxContainer, boxSectionStyle]}
          onLayout={measureDynamic}
        >
          <DynamicBox />
          <DynamicBox />
        </Animated.View>
      </View>

      <View style={styles.tabBar}>
        <TabButton
          label="Page A"
          isActive={activeTab === 'A'}
          onPress={() => onTabChange('A')}
        />
        <TabButton
          label="Page B"
          isActive={activeTab === 'B'}
          onPress={() => onTabChange('B')}
        />
      </View>
    </AnimatedHeaderBase>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  dynamicContent: {
    overflow: 'hidden',
  },
  headerWrapper: {
    backgroundColor: '#304077',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  boxContainer: {
    flexDirection: 'row',
    gap: 6,
    padding: 12,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 4,
  },
  pageLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
});

const content = generateContent({
  count: 500,
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
});
