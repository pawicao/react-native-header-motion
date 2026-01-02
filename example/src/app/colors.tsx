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
  interpolateColor,
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
    <HeaderMotion
      activeScrollId={activeScrollId.sv}
      progressThreshold={(measured) => measured * 10}
    >
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
              <Animated.ScrollView
                {...scrollViewProps}
                contentContainerStyle={{ paddingTop: originalHeaderHeight }}
              >
                {content}
              </Animated.ScrollView>
            )}
          </HeaderMotion.ScrollManager>
        </View>
        <View key="B">
          <HeaderMotion.ScrollManager scrollId="B">
            {(scrollViewProps, { originalHeaderHeight }) => (
              <Animated.ScrollView
                {...scrollViewProps}
                contentContainerStyle={{ paddingTop: originalHeaderHeight }}
              >
                {content}
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
  measureTotal,
  measureDynamic,
  activeTab,
  onTabChange,
}: WithCollapsiblePagedHeaderProps) {
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['#E3CBFC', '#FFFCC0']
      ),
    };
  });

  return (
    <AnimatedHeaderBase
      onLayout={measureTotal}
      style={[styles.headerWrapper, { paddingTop: insets.top }, animatedStyle]}
    >
      <TitleWithSubtitle
        title="Title"
        subtitle="Subtitle"
        titleColor="#304077"
        subtitleColor="#304077"
      />

      <Animated.View style={styles.boxContainer} onLayout={measureDynamic}>
        <DynamicBox backgroundColor="#304077" textColor="#FFF" />
        <DynamicBox backgroundColor="#304077" textColor="#FFF" />
      </Animated.View>

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
  headerWrapper: {
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
  backgroundColor: '#E6B16B',
  textColor: '#304077',
});
