import * as React from 'react';
import HeaderMotion, {
  useActiveScrollId,
  useMotionProgress,
  useRefreshControl,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  palette: readonly [string, string, string];
};

type ActiveTab = 'tracks' | 'about';

const indexToTab = new Map<number, ActiveTab>([
  [0, 'tracks'],
  [1, 'about'],
]);
const tabToIndex = new Map<ActiveTab, number>([
  ['tracks', 0],
  ['about', 1],
]);

const TRACKS: Track[] = [
  {
    id: 'ocean-drive',
    title: 'Tous les mêmes',
    artist: 'Stromae',
    duration: '3:31',
    palette: ['#FFC2B2', '#DBA287', '#FFEBD8'],
  },
  {
    id: 'golden-hour',
    title: 'Sweet Dreams, TN',
    artist: 'The Last Shadow Puppets',
    duration: '3:56',
    palette: ['#844529', '#191207', '#E6B01D'],
  },
  {
    id: 'island-in-the-sun',
    title: 'Four Out Of Five',
    artist: 'Arctic Monkeys',
    duration: '5:12',
    palette: ['#F3982C', '#F8F3EA', '#15130B'],
  },
  {
    id: 'waves',
    title: 'End of Beginning',
    artist: 'Djo',
    duration: '2:39',
    palette: ['#06B6D4', '#38BDF8', '#0F172A'],
  },
  {
    id: 'sunset-lover',
    title: 'BAILE INoLVIDABLE',
    artist: 'Bad Bunny',
    duration: '6:08',
    palette: ['#FB7185', '#F59E0B', '#312E81'],
  },
  {
    id: 'feel-good',
    title: 'Fine Line',
    artist: 'Harry Styles',
    duration: '6:18',
    palette: ['#A855F7', '#EC4899', '#0F172A'],
  },
  {
    id: 'heatwave',
    title: 'Fils de joie',
    artist: 'Stromae',
    duration: '3:15',
    palette: ['#F97316', '#FB7185', '#111827'],
  },
  {
    id: 'midnight-city',
    title: 'Midnight City',
    artist: 'M83',
    duration: '4:03',
    palette: ['#2563EB', '#A855F7', '#020617'],
  },
  {
    id: 'sweet-disposition',
    title: 'Sweet Disposition',
    artist: 'The Temper Trap',
    duration: '3:53',
    palette: ['#22C55E', '#67E8F9', '#1E293B'],
  },
  {
    id: 'sunset',
    title: 'Sunset',
    artist: 'The xx',
    duration: '3:38',
    palette: ['#F43F5E', '#F59E0B', '#18181B'],
  },
  {
    id: 'walking-on-a-dream',
    title: 'Walking On A Dream',
    artist: 'Empire Of The Sun',
    duration: '3:18',
    palette: ['#FDE047', '#F97316', '#1E1B4B'],
  },
  {
    id: 'electric-feel',
    title: 'Electric Feel',
    artist: 'MGMT',
    duration: '3:49',
    palette: ['#84CC16', '#22D3EE', '#111827'],
  },
  {
    id: 'borderline',
    title: 'Borderline',
    artist: 'Tame Impala',
    duration: '3:57',
    palette: ['#F472B6', '#A78BFA', '#172554'],
  },
  {
    id: 'summer',
    title: 'Summer',
    artist: 'Calvin Harris',
    duration: '3:44',
    palette: ['#38BDF8', '#FBBF24', '#0C4A6E'],
  },
  {
    id: 'firestone',
    title: 'Firestone',
    artist: 'Kygo, Conrad Sewell',
    duration: '4:33',
    palette: ['#FB923C', '#F43F5E', '#1F2937'],
  },
  {
    id: 'the-nights',
    title: 'The Nights',
    artist: 'Avicii',
    duration: '2:58',
    palette: ['#22C55E', '#FDE68A', '#064E3B'],
  },
  {
    id: 'sun-models',
    title: 'Sun Models',
    artist: 'ODESZA, Madelyn Grant',
    duration: '2:40',
    palette: ['#06B6D4', '#A855F7', '#082F49'],
  },
  {
    id: 'feel-it-still',
    title: 'Feel It Still',
    artist: 'Portugal. The Man',
    duration: '2:43',
    palette: ['#F97316', '#EC4899', '#27272A'],
  },
  {
    id: 'stolen-dance',
    title: 'Stolen Dance',
    artist: 'Milky Chance',
    duration: '5:13',
    palette: ['#A3E635', '#FACC15', '#1F2937'],
  },
  {
    id: 'young-blood',
    title: 'Young Blood',
    artist: 'The Naked And Famous',
    duration: '4:06',
    palette: ['#60A5FA', '#F472B6', '#111827'],
  },
];

const ABOUT_DETAILS = [
  { label: 'Curator', value: 'Oskar Pawica' },
  { label: 'Mood', value: 'Warm sunset house, indie pop, poolside synths' },
  { label: 'Updated', value: 'Weekly during summer' },
  { label: 'Total length', value: '20 songs - 1h 18m' },
] as const;

const BAR_LEVELS = [
  0.38, 0.78, 0.52, 0.7, 0.46, 0.62, 0.86, 0.48, 0.58, 0.74, 0.44, 0.66, 0.94,
  0.5, 0.82, 0.57, 0.72, 0.42, 0.63, 0.79, 0.55, 0.68, 0.45, 0.88, 0.52, 0.76,
  0.49, 0.69, 0.96, 0.6, 0.73, 0.54, 0.83, 0.47, 0.64, 0.91, 0.51, 0.71, 0.56,
  0.8,
] as const;

const BAR_COLORS = ['#EC4899', '#A855F7', '#3B82F6', '#06B6D4'] as const;

export default function Screen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeScrollId, setActiveScrollId] =
    useActiveScrollId<ActiveTab>('tracks');
  const pagerRef = React.useRef<PagerView>(null);
  const insets = useSafeAreaInsets();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2600);
  }, []);

  const handleTabChange = React.useCallback((tab: ActiveTab) => {
    pagerRef.current?.setPage(tabToIndex.get(tab)!);
  }, []);

  const onPageSelected = React.useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      setActiveScrollId(indexToTab.get(event.nativeEvent.position)!);
    },
    [setActiveScrollId]
  );

  const renderRefreshControl = () => (
    <HeaderMotion.RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      triggerDistance={92}
      progressCommitDuration={260}
      progressSettleDuration={520}
    />
  );

  return (
    <HeaderMotion
      activeScrollId={activeScrollId.sv}
      progressThreshold={(measured) => Math.max(0, measured - insets.top / 2)}
    >
      <StatusBar style="light" />
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <PlaylistHeader
                    activeTab={activeScrollId.state}
                    onTabChange={handleTabChange}
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
        <View key="tracks" style={styles.page}>
          <HeaderMotion.FlatList
            scrollId="tracks"
            style={styles.screen}
            contentContainerStyle={styles.listContent}
            data={TRACKS}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TrackRow index={index + 1} track={item} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={<MiniPlayer />}
            refreshControl={renderRefreshControl()}
          />
        </View>
        <View key="about" style={styles.page}>
          <HeaderMotion.ScrollView
            scrollId="about"
            style={styles.screen}
            contentContainerStyle={styles.aboutContent}
            refreshControl={renderRefreshControl()}
          >
            <AboutContent />
          </HeaderMotion.ScrollView>
        </View>
      </PagerView>
    </HeaderMotion>
  );
}

function PlaylistHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}) {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    return {
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [0, -threshold],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const dynamicStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.48],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [0, -threshold * 0.22],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [1, 0.94],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.58, 1],
      [0, 0.35, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [18, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <HeaderMotion.Header
      style={[styles.header, { paddingTop: insets.top + 8 }, containerStyle]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['#AD176B', '#1B2277', '#045C6A', '#020712']}
        locations={[0, 0.32, 0.62, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.headerGradient}
      />
      <HeaderMotion.Header.Dynamic style={[styles.dynamicHeader, dynamicStyle]}>
        <View style={styles.headerGlowPink} />
        <View style={styles.headerGlowBlue} />
        <View style={styles.playlistRow}>
          <CoverArt size="large" />
          <View style={styles.playlistCopy}>
            <Text style={styles.playlistTitle}>Summer Vibes</Text>
            <Text style={styles.playlistSubtitle}>
              Feel the sun, chase the waves and let the music set you free.
            </Text>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>O</Text>
              </View>
              <Text style={styles.authorText}>by Oskar Pawica</Text>
            </View>
            <Text style={styles.metaText}>20 songs - 1h 18m</Text>
          </View>
        </View>

        <View style={styles.equalizerSlot}>
          <AnimatedDivider />
          <Equalizer />
        </View>

        <View style={styles.actionRow}>
          <View style={[styles.primaryButton, styles.buttonShadow]}>
            <Text style={styles.primaryButtonIcon}>{'\u25B6'}</Text>
            <Text style={styles.primaryButtonText}>Play</Text>
          </View>
          <View style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonIcon}>{'\u21C4'}</Text>
            <Text style={styles.secondaryButtonText}>Shuffle</Text>
          </View>
          <View style={styles.iconButton}>
            <Text style={styles.heartText}>{'\u2661'}</Text>
          </View>
        </View>
      </HeaderMotion.Header.Dynamic>
      <View style={styles.persistentHeader}>
        <Animated.Text style={[styles.compactTitle, compactTitleStyle]}>
          Summer Vibes
        </Animated.Text>
        <PlaylistTabs activeTab={activeTab} onTabChange={onTabChange} />
      </View>
    </HeaderMotion.Header>
  );
}

function PlaylistTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}) {
  return (
    <View style={styles.tabs}>
      <Pressable
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'tracks' }}
        onPress={() => onTabChange('tracks')}
      >
        <Text
          style={
            activeTab === 'tracks'
              ? styles.activeTabText
              : styles.inactiveTabText
          }
        >
          Tracks
        </Text>
        {activeTab === 'tracks' ? (
          <View style={styles.activeTabIndicator} />
        ) : null}
      </Pressable>
      <Pressable
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'about' }}
        onPress={() => onTabChange('about')}
      >
        <Text
          style={
            activeTab === 'about'
              ? styles.activeTabText
              : styles.inactiveTabText
          }
        >
          About
        </Text>
        {activeTab === 'about' ? (
          <View style={styles.activeTabIndicator} />
        ) : null}
      </Pressable>
    </View>
  );
}

function AnimatedDivider() {
  const refresh = useRefreshControl();

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      refresh.progress.value,
      [0, 0.35, 0.75],
      [1, 0.42, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scaleX: interpolate(
          refresh.progress.value,
          [0, 1],
          [1, 0.82],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return <Animated.View style={[styles.equalizerDivider, style]} />;
}

function Equalizer() {
  const refresh = useRefreshControl();
  const clock = useSharedValue(0);
  const waveMix = useSharedValue(0);

  useAnimatedReaction(
    () => refresh.isRefreshing.value || refresh.isSettling.value,
    (isMoving) => {
      waveMix.value = withTiming(isMoving ? 1 : 0, {
        duration: isMoving ? 280 : 180,
      });
    }
  );

  useFrameCallback((frame) => {
    if (
      refresh.isRefreshing.value ||
      refresh.isSettling.value ||
      waveMix.value > 0.02
    ) {
      clock.value += frame.timeSincePreviousFrame ?? 16;
    }
  });

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      refresh.progress.value,
      [0, 0.24, 1],
      [0, 0.36, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View style={[styles.equalizer, style]}>
      {BAR_LEVELS.map((level, index) => (
        <EqualizerBar
          key={index}
          index={index}
          level={level}
          clock={clock}
          waveMix={waveMix}
        />
      ))}
    </Animated.View>
  );
}

function EqualizerBar({
  index,
  level,
  clock,
  waveMix,
}: {
  index: number;
  level: number;
  clock: SharedValue<number>;
  waveMix: SharedValue<number>;
}) {
  const refresh = useRefreshControl();
  const color = BAR_COLORS[index % BAR_COLORS.length] ?? BAR_COLORS[0];

  const style = useAnimatedStyle(() => {
    const reveal = interpolate(
      Math.min(refresh.progress.value, 1),
      [0, 0.18, 1],
      [0, 0.28, 1],
      Extrapolation.CLAMP
    );
    const dragLevel = 0.24 + level * 0.76;
    const beat =
      0.26 +
      0.74 *
        Math.pow(
          0.5 + Math.sin(clock.value / (120 + index * 7) + index * 0.68) * 0.5,
          1.55
        );
    const blendedLevel = dragLevel * (1 - waveMix.value) + beat * waveMix.value;

    return {
      height: 4 + 48 * reveal * blendedLevel,
      opacity: interpolate(reveal, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(reveal, [0, 1], [12, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.equalizerBar, { backgroundColor: color }, style]}
    />
  );
}

function TrackRow({ track }: { index: number; track: Track }) {
  return (
    <View style={styles.trackRow}>
      <ArtworkTile palette={track.palette} />
      {/* <Text style={styles.trackIndex}>{index}</Text> */}
      <View style={styles.trackCopy}>
        <Text style={styles.trackTitle}>{track.title}</Text>
        <Text style={styles.trackArtist}>{track.artist}</Text>
      </View>
      <Text style={styles.duration}>{track.duration}</Text>
      <Text style={styles.moreText}>{'...'}</Text>
    </View>
  );
}

function ArtworkTile({
  palette,
}: {
  palette: readonly [string, string, string];
}) {
  return (
    <View style={[styles.artwork, { backgroundColor: palette[2] }]}>
      <View style={[styles.artworkSun, { backgroundColor: palette[1] }]} />
      <View style={[styles.artworkHorizon, { backgroundColor: palette[0] }]} />
      <View style={styles.artworkPalm} />
    </View>
  );
}

function CoverArt({ size }: { size: 'large' | 'mini' }) {
  return (
    <View
      style={[
        styles.coverArt,
        size === 'mini' ? styles.coverArtMini : styles.coverArtLarge,
      ]}
    >
      <View style={styles.coverSkyGlow} />
      <View style={styles.coverSun} />
      <View style={styles.coverSunReflection} />
      <View style={styles.coverIsland} />
      <View style={styles.coverShorelineOne} />
      <View style={styles.coverShorelineTwo} />
      <View style={styles.coverPalmTrunk} />
      <View style={[styles.coverPalmLeaf, styles.coverPalmLeafOne]} />
      <View style={[styles.coverPalmLeaf, styles.coverPalmLeafTwo]} />
      <View style={[styles.coverPalmLeaf, styles.coverPalmLeafThree]} />
    </View>
  );
}

function AboutContent() {
  return (
    <View style={styles.aboutWrap}>
      <View style={styles.aboutHero}>
        <Text style={styles.aboutEyebrow}>Playlist notes</Text>
        <Text style={styles.aboutTitle}>
          Sunset-ready tracks for long drives.
        </Text>
        <Text style={styles.aboutBody}>
          Summer Vibes is built around warm synth lines, beach-house percussion,
          and vocal hooks that feel good without getting too loud. It starts
          bright, settles into a rolling groove, and keeps enough neon in the
          edges for late-night listening.
        </Text>
      </View>

      <View style={styles.detailGrid}>
        {ABOUT_DETAILS.map((detail) => (
          <View key={detail.label} style={styles.detailItem}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>Best moments</Text>
        <Text style={styles.aboutBody}>
          Pull it up while the first chorus of Ocean Drive hits, then let Golden
          Hour and Waves carry the tempo. The back half leans more open-air: The
          Nights, Sun Models, and Young Blood are the big-window tracks.
        </Text>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>Refresh behavior</Text>
        <Text style={styles.aboutBody}>
          The equalizer is driven by HeaderMotion refresh progress. During the
          pull it reveals as a calm meter, then blends into moving playback bars
          while refreshing before settling back into the header.
        </Text>
      </View>
    </View>
  );
}

function MiniPlayer() {
  return (
    <View style={styles.miniPlayer}>
      <CoverArt size="mini" />
      <View style={styles.miniCopy}>
        <Text style={styles.miniTitle}>Ocean Drive</Text>
        <Text style={styles.miniArtist}>Duke Dumont</Text>
      </View>
      <Text style={styles.miniIcon}>{'||'}</Text>
      <Text style={styles.miniIcon}>{'|>'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#020712',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    backgroundColor: '#020712',
  },
  aboutContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    backgroundColor: '#020712',
  },
  header: {
    backgroundColor: '#07111F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerGlowPink: {
    position: 'absolute',
    top: -80,
    left: -64,
    width: 280,
    height: 210,
    borderRadius: 80,
    backgroundColor: 'rgba(236,72,153,0.48)',
    transform: [{ rotate: '-18deg' }],
  },
  headerGlowBlue: {
    position: 'absolute',
    top: -36,
    right: -72,
    width: 260,
    height: 260,
    borderRadius: 110,
    backgroundColor: 'rgba(14,165,233,0.28)',
    transform: [{ rotate: '22deg' }],
  },
  dynamicHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    zIndex: 1,
  },
  persistentHeader: {
    position: 'relative',
    zIndex: 4,
  },
  compactTitle: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 62,
    height: 32,
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverArt: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
    backgroundColor: '#171144',
  },
  coverArtLarge: {
    width: 128,
    height: 136,
  },
  coverArtMini: {
    width: 44,
    height: 44,
    borderRadius: 5,
  },
  coverSkyGlow: {
    position: 'absolute',
    top: -24,
    left: -22,
    right: -20,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#EC4899',
    opacity: 0.88,
    transform: [{ rotate: '-12deg' }],
  },
  coverSun: {
    position: 'absolute',
    top: 42,
    right: 26,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDBA74',
  },
  coverSunReflection: {
    position: 'absolute',
    right: 18,
    bottom: 29,
    width: 62,
    height: 9,
    borderRadius: 9,
    backgroundColor: '#F472B6',
    opacity: 0.86,
    transform: [{ rotate: '-8deg' }],
  },
  coverIsland: {
    position: 'absolute',
    left: -18,
    bottom: 34,
    width: 92,
    height: 46,
    borderTopRightRadius: 56,
    backgroundColor: '#060816',
    transform: [{ rotate: '-7deg' }],
  },
  coverShorelineOne: {
    position: 'absolute',
    left: 34,
    right: -18,
    bottom: 25,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#F0ABFC',
    transform: [{ rotate: '-8deg' }],
  },
  coverShorelineTwo: {
    position: 'absolute',
    left: 54,
    right: -12,
    bottom: 15,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#22D3EE',
    opacity: 0.78,
    transform: [{ rotate: '-8deg' }],
  },
  coverPalmTrunk: {
    position: 'absolute',
    left: 22,
    top: 19,
    width: 6,
    height: 78,
    borderRadius: 4,
    backgroundColor: '#020617',
    transform: [{ rotate: '13deg' }],
  },
  coverPalmLeaf: {
    position: 'absolute',
    left: 21,
    top: 16,
    width: 48,
    height: 9,
    borderRadius: 9,
    backgroundColor: '#020617',
  },
  coverPalmLeafOne: {
    transform: [{ rotate: '-34deg' }],
  },
  coverPalmLeafTwo: {
    width: 42,
    transform: [{ rotate: '14deg' }],
  },
  coverPalmLeafThree: {
    left: 2,
    width: 36,
    transform: [{ rotate: '-6deg' }],
  },
  playlistCopy: {
    flex: 1,
    paddingLeft: 18,
    gap: 8,
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  playlistSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9A8D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#4A044E',
    fontSize: 12,
    fontWeight: '900',
  },
  authorText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  metaText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    fontWeight: '600',
  },
  equalizerSlot: {
    height: 64,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  equalizerDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 26,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  equalizer: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  equalizerBar: {
    width: 4,
    minHeight: 4,
    borderRadius: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  buttonShadow: {
    shadowColor: '#EC4899',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryButton: {
    flex: 1.1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#B94DFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '500',
  },
  tabs: {
    height: 46,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  inactiveTabText: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 15,
    fontWeight: '800',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 54,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EC4899',
  },
  trackRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 7,
    overflow: 'hidden',
    marginRight: 14,
  },
  artworkSun: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 22,
    height: 22,
    borderRadius: 11,
    opacity: 0.9,
  },
  artworkHorizon: {
    position: 'absolute',
    left: -8,
    right: -8,
    bottom: 0,
    height: 18,
    transform: [{ rotate: '-8deg' }],
  },
  artworkPalm: {
    position: 'absolute',
    left: 10,
    bottom: 13,
    width: 4,
    height: 26,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    transform: [{ rotate: '18deg' }],
  },
  trackIndex: {
    width: 24,
    color: 'rgba(255,255,255,0.64)',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 10,
  },
  trackCopy: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  duration: {
    width: 42,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  moreText: {
    width: 28,
    color: 'rgba(255,255,255,0.66)',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
    paddingBottom: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 100,
  },
  miniPlayer: {
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 12,
  },
  miniCopy: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  miniArtist: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  miniIcon: {
    width: 40,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  aboutWrap: {
    gap: 18,
  },
  aboutHero: {
    paddingTop: 8,
    gap: 10,
  },
  aboutEyebrow: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  aboutTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  aboutBody: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  detailGrid: {
    gap: 10,
  },
  detailItem: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    marginTop: 5,
  },
  aboutSection: {
    gap: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
