import { TabButton, Text, generateContent } from '@/components';
import HeaderMotion, {
  useActiveScrollId,
  useMotionProgress,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { useRef } from 'react';
import {
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const PIC =
  'https://images.unsplash.com/photo-1716237389409-2a8eb869d74a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
// const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

const indexToKey = new Map([
  [0, 'details'],
  [1, 'tracking'],
]);
const keyToIndex = new Map([
  ['details', 0],
  ['tracking', 1],
]);

export default function Screen() {
  const [activeScrollId, setActiveScrollId] =
    useActiveScrollId<string>('details');
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = (key: string) => {
    pagerRef.current?.setPage(keyToIndex.get(key)!);
  };

  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setActiveScrollId(indexToKey.get(e.nativeEvent.position)!);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#26282e' }}>
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
          <View key="details">
            <HeaderMotion.ScrollView scrollId="details">
              <DetailsPage />
            </HeaderMotion.ScrollView>
          </View>
          <View key="tracking">
            <HeaderMotion.ScrollView scrollId="tracking">
              <TrackingPage />
            </HeaderMotion.ScrollView>
          </View>
        </PagerView>
      </HeaderMotion>
    </View>
  );
}

function CollapsibleHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (newTab: string) => void;
}) {
  const windowDimensions = useWindowDimensions();
  const imageWidth = windowDimensions.width;
  const imageHeight = windowDimensions.height * 0.6;
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

  void activeTab;
  void onTabChange;
  void insets;
  void containerStyle;
  void titleStyle;
  void boxSectionStyle;

  return (
    <HeaderMotion.Header
      pannable
      panDecayConfig={(e) => {
        'worklet';

        return {
          velocity: e.velocityY * 1.4,
          deceleration: 0.997,
        };
      }}
      style={{ backgroundColor: '#26282e' }}
    >
      <StatusBar style="light" />
      <AnimatedImageBackground
        source={{ uri: PIC }}
        style={{
          width: imageWidth,
          height: imageHeight,
        }}
        resizeMode="cover"
      >
        <LinearGradient
          style={{
            inset: 0,
            position: 'absolute',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 16,
          }}
          colors={['rgba(38,40,46,0)', 'rgba(38,40,46,1)']}
        >
          <Animated.View style={{ alignItems: 'center' }}>
            <Text weight="700" style={{ fontSize: 72, color: '#FFF' }}>
              5
            </Text>
            <Text weight="700" style={{ fontSize: 28, color: '#FFF' }}>
              minutes left
            </Text>
            <View id="segmented-progress-bar" style={styles.progressWrapper}>
              <View style={styles.progressTrack}>
                {[0, 1, 2, 3].map((segmentIndex) => (
                  <View
                    key={segmentIndex}
                    style={[
                      styles.progressSegment,
                      segmentIndex <= 2
                        ? styles.progressSegmentActive
                        : styles.progressSegmentInactive,
                    ]}
                  />
                ))}
              </View>
              {/* <Text weight="700" style={{ color: '#FFF' }}>
                Alfredo&apos;s Pizza Cafe
              </Text> */}
              <Text weight="500" style={styles.progressLabel}>
                Your order is on its way
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </AnimatedImageBackground>
      <View style={styles.tabBar}>
        <TabButton
          label="Details"
          isActive={activeTab === 'details'}
          // onPress={() => onTabChange('A')}
        />
        <TabButton
          label="Tracking"
          isActive={activeTab === 'tracking'}
          // onPress={() => onTabChange('B')}
        />
      </View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  image: {},
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
    // backgroundColor: '#FFF',
    // borderTopWidth: 1,
    // borderTopColor: '#EEE',
    paddingBottom: 4,
  },
  progressWrapper: {
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressSegment: {
    width: 54,
    height: 12,
    borderRadius: 999,
  },
  progressSegmentActive: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  progressSegmentInactive: {
    backgroundColor: 'rgba(34,197,94,0.22)',
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.3,
  },
});

function DetailsPage() {
  return null;
}

function TrackingPage() {
  return null;
}
