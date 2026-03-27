import { ContentCard, DynamicBox, TitleWithSubtitle } from '@/components';
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListRow = { key: string; index: number };

type FL = ComponentProps<typeof HeaderMotion.FlatList<ListRow>>;
type FLFn<TKey extends keyof FL> = Extract<
  Exclude<FL[TKey], undefined>,
  (...args: any[]) => any
>;

const LIST_DATA: ListRow[] = Array.from({ length: 120 }, (_, k) => ({
  key: `row-${k}`,
  index: k + 1,
}));

export default function Screen() {
  const handlers = useFlatListHandlerLoggers();

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
      <HeaderMotion.FlatList
        data={LIST_DATA}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ContentCard
            index={item.index}
            backgroundColor="#E3CBFC"
            textColor="#304077"
            label="FlatList row"
          />
        )}
        {...handlers}
      />
    </HeaderMotion>
  );
}

function useFlatListHandlerLoggers() {
  const prefix = '[HeaderMotion.FlatList consumer]';

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 35,
  }).current;

  const onViewableItemsChanged = useCallback<FLFn<'onViewableItemsChanged'>>(
    (info) => {
      console.log(prefix, 'onViewableItemsChanged', {
        viewableCount: info.viewableItems.length,
        changedCount: info.changed.length,
        firstVisibleIndex: info.viewableItems[0]?.index,
      });
    },
    []
  );

  return {
    onScrollBeginDrag: useCallback<FLFn<'onScrollBeginDrag'>>((e) => {
      console.log(prefix, 'onScrollBeginDrag', {
        y: e.nativeEvent.contentOffset.y,
      });
    }, []),
    onScrollEndDrag: useCallback<FLFn<'onScrollEndDrag'>>((e) => {
      console.log(prefix, 'onScrollEndDrag', {
        y: e.nativeEvent.contentOffset.y,
      });
    }, []),
    onMomentumScrollBegin: useCallback<FLFn<'onMomentumScrollBegin'>>((e) => {
      console.log(prefix, 'onMomentumScrollBegin', {
        y: e.nativeEvent.contentOffset.y,
      });
    }, []),
    onMomentumScrollEnd: useCallback<FLFn<'onMomentumScrollEnd'>>((e) => {
      console.log(prefix, 'onMomentumScrollEnd', {
        y: e.nativeEvent.contentOffset.y,
      });
    }, []),
    onContentSizeChange: useCallback<FLFn<'onContentSizeChange'>>((w, h) => {
      console.log(prefix, 'onContentSizeChange', { width: w, height: h });
    }, []),
    onScroll: useCallback<FLFn<'onScroll'>>((e) => {
      console.log(prefix, 'onScroll', {
        y: e.nativeEvent.contentOffset.y,
      });
    }, []),
    viewabilityConfig,
    onViewableItemsChanged,
    onEndReached: useCallback<FLFn<'onEndReached'>>((info) => {
      console.log(prefix, 'onEndReached', info);
    }, []),
    onEndReachedThreshold: 0.25,
    onStartReached: useCallback<FLFn<'onStartReached'>>((info) => {
      console.log(prefix, 'onStartReached', info);
    }, []),
    onStartReachedThreshold: 0.25,
    onScrollToIndexFailed: useCallback<FLFn<'onScrollToIndexFailed'>>(
      (info) => {
        console.log(prefix, 'onScrollToIndexFailed', info);
      },
      []
    ),
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
        <TitleWithSubtitle title="FlatList handlers" subtitle="" />
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
