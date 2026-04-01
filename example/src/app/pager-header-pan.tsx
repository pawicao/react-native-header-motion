/* eslint-disable react-native/no-inline-styles */
import { TabButton, Text, TitleWithSubtitle } from '@/components';
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

interface PizzaItem {
  id: string;
  name: string;
  desc: string;
  price: number;
}

const PIZZA_ORDER: PizzaItem[] = [
  {
    id: '1',
    name: 'Margherita Classica',
    desc: 'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil',
    price: 21.37,
  },
  {
    id: '2',
    name: 'Pepperoni Feast',
    desc: 'Double pepperoni, mozzarella, house-made marinara sauce',
    price: 18.99,
  },
  {
    id: '3',
    name: 'Quattro Formaggi',
    desc: 'Mozzarella, gorgonzola, fontina, parmigiano-reggiano',
    price: 23.5,
  },
  {
    id: '4',
    name: 'Diavola',
    desc: 'Spicy salami, Calabrian chili, roasted peppers, mozzarella',
    price: 19.75,
  },
  {
    id: '5',
    name: 'Prosciutto e Funghi',
    desc: 'Prosciutto di Parma, wild mushrooms, truffle cream, arugula',
    price: 22.0,
  },
  {
    id: '6',
    name: 'Hawaiian Supreme',
    desc: 'Smoked ham, caramelized pineapple, jalapeño, mozzarella',
    price: 20.5,
  },
  {
    id: '7',
    name: 'Truffle Mushroom',
    desc: 'Mixed wild mushrooms, truffle oil, fontina, fresh thyme',
    price: 24.99,
  },
  {
    id: '8',
    name: 'Calzone Ripieno',
    desc: 'Folded pizza with ricotta, ham, mushrooms, mozzarella',
    price: 17.5,
  },
  {
    id: '9',
    name: 'Capricciosa',
    desc: 'Artichoke hearts, ham, mushrooms, olives, mozzarella',
    price: 21.5,
  },
  {
    id: '10',
    name: 'Bufala e Nduja',
    desc: 'Buffalo mozzarella, spicy nduja, cherry tomatoes, basil',
    price: 25.99,
  },
  {
    id: '11',
    name: 'Tonno e Cipolla',
    desc: 'Italian tuna, red onion, capers, oregano, mozzarella',
    price: 19.5,
  },
  {
    id: '12',
    name: 'Pesto Genovese',
    desc: 'Fresh basil pesto, pine nuts, cherry tomatoes, burrata',
    price: 23.99,
  },
  {
    id: '13',
    name: 'Salsiccia e Friarielli',
    desc: 'Italian sausage, broccoli rabe, smoked provola, chili flakes',
    price: 22.5,
  },
  {
    id: '14',
    name: 'Garlic Knots',
    desc: 'Hand-tied dough knots, roasted garlic butter, parsley',
    price: 6.99,
  },
  {
    id: '15',
    name: 'Bruschetta Trio',
    desc: 'Tomato basil, ricotta honey, roasted pepper tapenade',
    price: 9.99,
  },
  {
    id: '16',
    name: 'Tiramisu',
    desc: 'Classic Italian dessert, mascarpone, espresso, cocoa',
    price: 8.5,
  },
  {
    id: '17',
    name: 'Panna Cotta',
    desc: 'Vanilla bean cream, mixed berry compote, mint',
    price: 7.99,
  },
];

const ORDER_TOTAL = PIZZA_ORDER.reduce((sum, item) => sum + item.price, 0);

interface TrackingStage {
  id: string;
  title: string;
  time: string | null;
  desc: string;
  detail: string;
  completed: boolean;
}

const TRACKING_STAGES: TrackingStage[] = [
  {
    id: '1',
    title: 'Order Confirmed',
    time: '6:42 PM',
    desc: "Your order has been received and confirmed by Alfredo's Pizza Cafe. Payment of $315.55 was processed successfully. A confirmation has been sent to your email with the full details of your order.",
    detail: 'Order #APZ-2847',
    completed: true,
  },
  {
    id: '2',
    title: 'Preparing Your Order',
    time: '6:45 PM',
    desc: 'Our chefs have started working on your pizzas. Fresh dough is being hand-stretched, premium ingredients are carefully selected, and each pizza is crafted with care in our authentic wood-fired oven at over 800\u00B0F.',
    detail: 'Kitchen station 3',
    completed: true,
  },
  {
    id: '3',
    title: 'Out for Delivery',
    time: '6:58 PM',
    desc: 'Your order has been picked up and is on its way! Delivery driver Marco is heading to your location with your freshly prepared pizzas in our insulated delivery bags to keep everything hot and delicious.',
    detail: 'ETA \u2248 5 min',
    completed: true,
  },
  {
    id: '4',
    title: 'Delivered',
    time: null,
    desc: 'Your order will be marked as delivered once it arrives at your doorstep. Rate your experience and leave feedback for the restaurant after delivery is complete.',
    detail: 'Waiting',
    completed: false,
  },
];

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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: 'none',
          headerTintColor: '#FFF',
          headerBackButtonDisplayMode: 'minimal',
          title: '',
          unstable_headerRightItems() {
            return [
              {
                type: 'button',
                label: '',
                icon: {
                  type: 'sfSymbol',
                  name: 'text.bubble',
                },
                onPress: () => {
                  // Do something
                },
              },
            ];
          },
        }}
      />
      <HeaderMotion activeScrollId={activeScrollId.sv}>
        <CollapsibleHeader
          activeTab={activeScrollId.state}
          onTabChange={handleTabPress}
        />
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={onPageSelected}
        >
          <View key="details">
            <DetailsPage />
          </View>
          <View key="tracking">
            <TrackingPage />
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
    const opacity = interpolate(
      progress.get(),
      [0.5, 0.8],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const timerStyle = useAnimatedStyle(() => {
    // const threshold = progressThreshold.get();
    // const parallaxTranslateY = interpolate(
    //   progress.get(),
    //   [0, 1],
    //   [0, threshold * 0.15],
    //   Extrapolation.CLAMP
    // );
    const opacity = interpolate(
      progress.get(),
      [0.35, 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      progress.get(),
      [0.35, 0.6],
      [1, 0.85],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

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
      style={[{ backgroundColor: '#26282e', zIndex: 1 }, containerStyle]}
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
          locations={[0, 0.25, 0.375, 0.45, 0.6, 0.75, 0.88, 1]}
          colors={[
            'rgba(0,0,0,0.7)',
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0)',
            'rgba(38,40,46,0)',
            'rgba(38,40,46,0.25)',
            'rgba(38,40,46,0.55)',
            'rgba(38,40,46,0.85)',
            'rgba(38,40,46,1)',
          ]}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: insets.top,
              },
              titleStyle,
            ]}
          >
            <TitleWithSubtitle
              title="Alfredo's Pizza Cafe"
              subtitle="5 minutes left"
            />
          </Animated.View>
          <HeaderMotion.Header.Dynamic>
            <Animated.View
              id="timer-and-stuff"
              style={[
                {
                  alignItems: 'center',
                  paddingBottom: 48,
                  paddingTop: 144,
                },
                timerStyle,
              ]}
            >
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
          </HeaderMotion.Header.Dynamic>
        </LinearGradient>
      </AnimatedImageBackground>
      <View style={styles.tabBar}>
        <TabButton
          label="Details"
          isActive={activeTab === 'details'}
          onPress={() => onTabChange('details')}
        />
        <TabButton
          label="Tracking"
          isActive={activeTab === 'tracking'}
          onPress={() => onTabChange('tracking')}
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

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

function DetailsPage() {
  return (
    <HeaderMotion.FlatList<PizzaItem>
      scrollId="details"
      data={PIZZA_ORDER}
      keyExtractor={(item) => item.id}
      contentContainerStyle={detailsStyles.list}
      ItemSeparatorComponent={ItemDivider}
      ListHeaderComponent={
        <View style={detailsStyles.header}>
          <View style={{ gap: 4, paddingVertical: 8, paddingTop: 32 }}>
            <Text weight="400" style={detailsStyles.headerSubtitle}>
              Your order from
            </Text>
            <Text weight="700" style={detailsStyles.headerTitle}>
              Alfredo&apos;s Pizza Cafe
            </Text>
          </View>
          {/* <View style={detailsStyles.badge}>
            <Text weight="600" style={detailsStyles.badgeText}>
              {PIZZA_ORDER.length} items
            </Text>
          </View> */}
        </View>
      }
      ListFooterComponent={
        <View style={detailsStyles.footer}>
          <View style={detailsStyles.divider} />
          <View style={detailsStyles.summaryRow}>
            <Text weight="500" style={detailsStyles.summaryLabel}>
              Subtotal
            </Text>
            <Text weight="500" style={detailsStyles.summaryValue}>
              {formatPrice(ORDER_TOTAL)}
            </Text>
          </View>
          <View style={detailsStyles.summaryRow}>
            <Text weight="500" style={detailsStyles.summaryLabel}>
              Delivery
            </Text>
            <Text weight="600" style={detailsStyles.freeLabel}>
              Free
            </Text>
          </View>
          <View style={[detailsStyles.divider, { marginTop: 14 }]} />
          <View style={detailsStyles.summaryRow}>
            <Text weight="700" style={detailsStyles.totalLabel}>
              Total
            </Text>
            <Text weight="700" style={detailsStyles.totalValue}>
              {formatPrice(ORDER_TOTAL)}
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={detailsStyles.item}>
          <View style={detailsStyles.itemRow}>
            <View style={detailsStyles.itemInfo}>
              <Text weight="600" style={detailsStyles.itemName}>
                {item.name}
              </Text>
              <Text weight="400" style={detailsStyles.itemDesc}>
                {item.desc}
              </Text>
            </View>
            <Text weight="600" style={detailsStyles.itemPrice}>
              {formatPrice(item.price)}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

function ItemDivider() {
  return <View style={detailsStyles.itemDivider} />;
}

const detailsStyles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFF',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  badge: {
    backgroundColor: 'rgba(34,197,94,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    color: '#22C55E',
  },
  item: {
    paddingVertical: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.38)',
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    color: '#FFF',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  footer: {
    marginTop: 24,
    paddingBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  summaryValue: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontVariant: ['tabular-nums'],
  },
  freeLabel: {
    fontSize: 15,
    color: '#22C55E',
  },
  totalLabel: {
    fontSize: 18,
    color: '#FFF',
  },
  totalValue: {
    fontSize: 18,
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
});

function TrackingPage() {
  return (
    <HeaderMotion.FlatList<TrackingStage>
      scrollId="tracking"
      data={TRACKING_STAGES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={trackingStyles.list}
      ListHeaderComponent={<View style={{ height: 32 }} />}
      renderItem={({ item, index }) => {
        const isLast = index === TRACKING_STAGES.length - 1;

        return (
          <View style={trackingStyles.stage}>
            <View style={trackingStyles.timeline}>
              <View
                style={[
                  trackingStyles.dot,
                  item.completed
                    ? trackingStyles.dotActive
                    : trackingStyles.dotMuted,
                ]}
              />
              {!isLast && (
                <View
                  style={[
                    trackingStyles.connector,
                    item.completed
                      ? trackingStyles.connectorActive
                      : trackingStyles.connectorMuted,
                  ]}
                />
              )}
            </View>

            <View style={trackingStyles.content}>
              <View style={trackingStyles.contentHeader}>
                <Text
                  weight="700"
                  style={[
                    trackingStyles.title,
                    !item.completed && trackingStyles.textMuted,
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  weight="500"
                  style={[
                    trackingStyles.time,
                    !item.completed && trackingStyles.textFaint,
                  ]}
                >
                  {item.time ?? '\u2014'}
                </Text>
              </View>

              <Text
                weight="400"
                style={[
                  trackingStyles.desc,
                  !item.completed && trackingStyles.textFaint,
                ]}
              >
                {item.desc}
              </Text>

              <View style={trackingStyles.contentFooter}>
                <Text
                  weight="500"
                  style={[
                    trackingStyles.detail,
                    !item.completed && trackingStyles.textFaint,
                  ]}
                >
                  {item.detail}
                </Text>
                <View
                  style={[
                    trackingStyles.statusPill,
                    item.completed
                      ? trackingStyles.statusPillActive
                      : trackingStyles.statusPillMuted,
                  ]}
                >
                  <Text
                    weight="600"
                    style={
                      item.completed
                        ? trackingStyles.statusTextActive
                        : trackingStyles.statusTextMuted
                    }
                  >
                    {item.completed ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const trackingStyles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  stage: {
    flexDirection: 'row',
    minHeight: 200,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  dotMuted: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  connector: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  connectorActive: {
    backgroundColor: 'rgba(34,197,94,0.3)',
  },
  connectorMuted: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 28,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    color: '#FFF',
  },
  time: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    fontVariant: ['tabular-nums'],
  },
  desc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 22,
    marginBottom: 16,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillActive: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  statusPillMuted: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusTextActive: {
    fontSize: 12,
    color: '#22C55E',
  },
  statusTextMuted: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
  },
  textMuted: {
    color: 'rgba(255,255,255,0.3)',
  },
  textFaint: {
    color: 'rgba(255,255,255,0.18)',
  },
});
