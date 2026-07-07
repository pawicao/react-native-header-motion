import { Link, type Href } from 'expo-router';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

interface ShowcaseItem {
  title: string;
  href: Href;
  icon: string;
}

interface ShowcaseSection {
  title: string;
  data: ShowcaseItem[];
}

const SECTIONS: ShowcaseSection[] = [
  {
    title: 'Core',
    data: [
      { title: 'Collapsible', href: '/simple', icon: '📦' },
      { title: 'Color Interpolation', href: '/colors', icon: '🎨' },
      { title: 'Overscroll', href: '/overscroll', icon: '🔄' },
      { title: 'FlatList', href: '/flatlist', icon: '📋' },
      { title: 'FlashList', href: '/flashlist', icon: '⚡️' },
      { title: 'LegendList', href: '/legendlist', icon: '🧾' },
      {
        title: 'Composing Navigation Header',
        href: '/composing-header',
        icon: '⛑️',
      },
    ],
  },
  {
    title: 'Pagers',
    data: [
      {
        title: 'ScrollView + Pager',
        href: '/collapsible-pager',
        icon: '📑',
      },
      {
        title: 'FlatList + Pager',
        href: '/flatlist-pager',
        icon: '📋📑',
      },
      {
        title: 'FlashList + Pager',
        href: '/flashlist-pager',
        icon: '⚡️📑',
      },
      {
        title: 'LegendList + Pager',
        href: '/legendlist-pager',
        icon: '🧾📑',
      },
    ],
  },
  {
    title: 'Offset Strategies',
    data: [
      { title: 'Offset: padding', href: '/offset-padding', icon: '↔️' },
      { title: 'Offset: margin', href: '/offset-margin', icon: '↕️' },
      { title: 'Offset: top', href: '/offset-top', icon: '⬆️' },
      { title: 'Offset: translate', href: '/offset-transform', icon: '🔀' },
      { title: 'Offset: none', href: '/offset-none', icon: '🚫' },
    ],
  },
  {
    title: 'Advanced',
    data: [{ title: 'ScrollManager', href: '/scroll-manager', icon: '⚙️' }],
  },
  {
    title: 'Consumer Handlers & Refs',
    data: [
      {
        title: 'ScrollView Handlers (console)',
        href: '/scroll-handlers',
        icon: '🖥️',
      },
      {
        title: 'FlatList Handlers (console)',
        href: '/flatlist-handlers',
        icon: '🖨️',
      },
      {
        title: 'Animated Handler (console)',
        href: '/animated-on-scroll',
        icon: '📊',
      },
      {
        title: 'External Ref (short content)',
        href: '/external-ref',
        icon: '🔗',
      },
      {
        title: 'Scroll To Button (external ref)',
        href: '/scroll-to-button',
        icon: '🎯',
      },
      {
        title: 'Scroll To Button (external ref) | FlatList',
        href: '/scroll-to-button',
        icon: '📋🎯',
      },
      {
        title: 'Scroll To Button (external ref) | FlashList',
        href: '/scroll-to-button',
        icon: '⚡️🎯',
      },
      {
        title: 'Scroll To Button (external ref) | LegendList',
        href: '/scroll-to-button',
        icon: '🧾🎯',
      },
    ],
  },
  {
    title: 'Refresh Control',
    data: [
      {
        title: 'Refresh ScrollView',
        href: '/refresh-scrollview-control',
        icon: '🔃',
      },
      {
        title: 'Custom Refresh Control',
        href: '/custom-refresh-control',
        icon: '🌀',
      },
      {
        title: 'Custom Refresh Control 2',
        href: '/custom-refresh-control-2',
        icon: '✨',
      },
      {
        title: 'Custom Refresh Control 3',
        href: '/custom-refresh-control-3',
        icon: '📊',
      },
      {
        title: 'Custom Refresh Control 4',
        href: '/custom-refresh-control-4',
        icon: '🏷️',
      },
      {
        title: 'Custom Refresh Control 5',
        href: '/custom-refresh-control-5',
        icon: '🧱',
      },
      {
        title: 'Custom Refresh Control 6',
        href: '/custom-refresh-control-6',
        icon: '◉',
      },
      {
        title: 'Music Streaming Refresh',
        href: '/music-streaming-refresh',
        icon: '🎵',
      },
      {
        title: 'Refresh FlatList (refreshControl)',
        href: '/refresh-flatlist-control',
        icon: '🔁',
      },
      {
        title: 'Refresh FlatList (refreshing/onRefresh)',
        href: '/refresh-flatlist-props',
        icon: '♻️',
      },
      {
        title: 'Refresh FlatList (custom offset)',
        href: '/refresh-flatlist-props-offset',
        icon: '📏',
      },
    ],
  },
  {
    title: 'Layout edge cases',
    data: [
      {
        title: 'Short Content (min height)',
        href: '/short-content',
        icon: '📐',
      },
      {
        title: 'Short Content (no min height)',
        href: '/short-content-no-min-height',
        icon: '📄',
      },
      { title: 'Header asChild', href: '/as-child', icon: '🧩' },
    ],
  },
  {
    title: 'Header Pan',
    data: [
      { title: 'Header Pan', href: '/header-pan', icon: '👆' },
      { title: 'Pager + Header Pan', href: '/pager-header-pan', icon: '👇' },
    ],
  },
];

export default function Screen() {
  return (
    <SectionList
      style={styles.screen}
      sections={SECTIONS}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={(item, index) => item.href.toString() + index}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Link href={item.href} asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.itemRow, pressed && styles.itemRowPressed]}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            )}
          </Pressable>
        </Link>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      stickySectionHeadersEnabled={false}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 48,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6B7280',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  itemRowPressed: {
    backgroundColor: '#E5E7EB',
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 54,
  },
  sectionSeparator: {
    height: 0,
  },
});
