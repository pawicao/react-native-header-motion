import {
  ContentCard,
  DynamicBox,
  TabButton,
  TitleWithSubtitle,
} from '@/components';
import HeaderMotion, {
  createHeaderMotionScrollable,
  useActiveScrollId,
  useMotionProgress,
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
import { FlashList } from '@shopify/flash-list';

const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
});

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
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <CollapsibleHeader
                    activeTab={activeScrollId.state}
                    onTabChange={handleTabPress}
                  />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        <View key="A">
          <HeaderMotionFlashList
            scrollId="A"
            data={content}
            keyExtractor={(item) => `${item.index}`}
            renderItem={({ item }) => (
              <ContentCard
                index={item.index}
                label={item.label}
                backgroundColor="#dcfce7"
                textColor="#14532d"
              />
            )}
          />
        </View>
        <View key="B">
          <HeaderMotionFlashList
            scrollId="B"
            data={content}
            keyExtractor={(item) => `${item.index}`}
            renderItem={({ item }) => (
              <ContentCard
                index={item.index}
                label={item.label}
                backgroundColor="#dcfce7"
                textColor="#14532d"
              />
            )}
          />
        </View>
      </PagerView>
    </HeaderMotion>
  );
}

function CollapsibleHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (newTab: string) => void;
}) {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  // 1. Container Animation (Moves UP)
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

  // 2. Title Animation (Counter-Moves DOWN to stay sticky)
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

  // 3. Content Animation (Parallax + Opacity + Scale)
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
      [0, 1 * 0.6],
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
      style={[styles.headerWrapper, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={[titleStyle]}>
        <TitleWithSubtitle title="Title" subtitle="Subtitle" />
      </Animated.View>

      <View style={styles.dynamicContent}>
        <HeaderMotion.Header.Dynamic
          style={[styles.boxContainer, boxSectionStyle]}
        >
          <DynamicBox />
          <DynamicBox />
        </HeaderMotion.Header.Dynamic>
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
    </HeaderMotion.Header>
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

const content = Array.from({ length: 500 }, (_, k) => ({
  index: k + 1,
  label: 'FlashList Item',
}));
