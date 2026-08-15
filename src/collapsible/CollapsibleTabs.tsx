import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { HeaderMotionScrollIdContext } from '../context';
import { useActiveScrollId } from '../hooks/useActiveScrollId';
import { Collapsible, type CollapsibleProps } from './Collapsible';
import {
  CollapsibleTabsContext,
  useCollapsibleTabsContextOrThrow,
  type CollapsibleTabsContextValue,
} from './context';
import {
  DefaultCollapsibleTabsPagerAdapter,
  type CollapsibleTabsPagerAdapter,
  type CollapsibleTabsPagerController,
} from './pagerAdapters';

/** A tab declaration: a plain name, or a name with a display label. */
export type CollapsibleTabsTabInput = string | { name: string; label?: string };

export interface CollapsibleTabsProps
  extends Omit<CollapsibleProps<string>, 'activeScrollId'> {
  /**
   * The tabs, in pager order. Each entry is a name or `{ name, label }` —
   * the label is what `CollapsibleTabs.Bar` displays and falls back to the
   * name.
   *
   * The names must match the `name` props of the `CollapsibleTabs.Tab`
   * children rendered inside `CollapsibleTabs.Pager`, in the same order.
   */
  tabs: readonly CollapsibleTabsTabInput[];
  /**
   * Name of the initially active tab.
   *
   * @default the first entry of `tabs`
   */
  initialTab?: string;
  /** Called whenever the active tab changes, from a swipe or `goTo`. */
  onTabChange?: (name: string) => void;
}

/**
 * High-level root for one collapsible header shared across multiple tabs.
 *
 * It renders a `Collapsible` root and owns the active-tab state: the
 * `activeScrollId` wiring, the pager coordination, and the tab bar state all
 * come from here. Each `CollapsibleTabs.Tab` provides its name as the default
 * `scrollId`, so the scrollables inside need no manual wiring.
 *
 * @example
 * ```tsx
 * <CollapsibleTabs tabs={['posts', 'about']} preset="parallax">
 *   <Collapsible.Header>
 *     <Collapsible.Pinned><TitleRow /></Collapsible.Pinned>
 *     <Collapsible.Dynamic><Hero /></Collapsible.Dynamic>
 *     <CollapsibleTabs.Bar />
 *   </Collapsible.Header>
 *   <CollapsibleTabs.Pager>
 *     <CollapsibleTabs.Tab name="posts">
 *       <Collapsible.FlatList data={posts} renderItem={renderPost} />
 *     </CollapsibleTabs.Tab>
 *     <CollapsibleTabs.Tab name="about">
 *       <Collapsible.ScrollView>{about}</Collapsible.ScrollView>
 *     </CollapsibleTabs.Tab>
 *   </CollapsibleTabs.Pager>
 * </CollapsibleTabs>
 * ```
 */
function CollapsibleTabsRoot({
  tabs,
  initialTab,
  onTabChange,
  children,
  ...collapsibleProps
}: CollapsibleTabsProps) {
  const normalizedTabs = useMemo(
    () =>
      tabs.map((tab) =>
        typeof tab === 'string'
          ? { name: tab, label: tab }
          : { name: tab.name, label: tab.label ?? tab.name }
      ),
    [tabs]
  );

  if (normalizedTabs.length === 0) {
    throw new Error(
      '[react-native-header-motion] CollapsibleTabs requires at least one tab.'
    );
  }

  // The initial tab is resolved once — later `initialTab` changes must not
  // re-run it, mirroring how pagers treat their `initialPage`.
  const initialRef = useRef<{ name: string; index: number } | null>(null);
  if (initialRef.current === null) {
    let index = initialTab
      ? normalizedTabs.findIndex((tab) => tab.name === initialTab)
      : 0;
    if (index < 0) {
      if (__DEV__) {
        console.warn(
          `[react-native-header-motion] CollapsibleTabs: initialTab "${initialTab}" is not in \`tabs\`. Falling back to the first tab.`
        );
      }
      index = 0;
    }

    initialRef.current = { name: normalizedTabs[index]!.name, index };
  }

  const [activeScrollId, setActiveScrollId] = useActiveScrollId(
    initialRef.current.name
  );
  const controllerRef = useRef<CollapsibleTabsPagerController | null>(null);

  const onTabChangeRef = useRef(onTabChange);
  useEffect(() => {
    onTabChangeRef.current = onTabChange;
  });

  const activeTab = activeScrollId.state;

  const setActiveTab = useCallback(
    (name: string) => {
      setActiveScrollId(name);
      onTabChangeRef.current?.(name);
    },
    [setActiveScrollId]
  );

  const goTo = useCallback(
    (name: string) => {
      const index = normalizedTabs.findIndex((tab) => tab.name === name);
      if (index < 0) {
        if (__DEV__) {
          console.warn(
            `[react-native-header-motion] CollapsibleTabs: unknown tab "${name}".`
          );
        }
        return;
      }

      controllerRef.current?.setIndex(index);
      if (name !== activeTab) {
        setActiveTab(name);
      }
    },
    [normalizedTabs, activeTab, setActiveTab]
  );

  const onPagerIndexChange = useCallback(
    (index: number) => {
      const tab = normalizedTabs[index];
      if (!tab || tab.name === activeTab) {
        return;
      }

      setActiveTab(tab.name);
    },
    [normalizedTabs, activeTab, setActiveTab]
  );

  const contextValue = useMemo<CollapsibleTabsContextValue>(
    () => ({
      tabs: normalizedTabs,
      activeTab,
      goTo,
      initialIndex: initialRef.current!.index,
      controllerRef,
      onPagerIndexChange,
    }),
    [normalizedTabs, activeTab, goTo, onPagerIndexChange]
  );

  return (
    <Collapsible activeScrollId={activeScrollId.sv} {...collapsibleProps}>
      <CollapsibleTabsContext.Provider value={contextValue}>
        {children}
      </CollapsibleTabsContext.Provider>
    </Collapsible>
  );
}

export interface CollapsibleTabsPagerProps {
  /**
   * The pager engine to render with.
   *
   * Defaults to the dependency-free built-in (a paging horizontal
   * `ScrollView`). Pass `createPagerViewAdapter(PagerView)` for
   * `react-native-pager-view`, or any custom `CollapsibleTabsPagerAdapter`.
   */
  adapter?: CollapsibleTabsPagerAdapter;
  /** Style for the pager container. Defaults to `flex: 1`. */
  style?: StyleProp<ViewStyle>;
  /** `CollapsibleTabs.Tab` children, in the same order as the `tabs` prop. */
  children: ReactNode;
}

/**
 * Renders the swipeable pages of a `CollapsibleTabs` setup through a pager
 * adapter and keeps the pager in sync with the active tab.
 */
function CollapsibleTabsPager({
  adapter: Adapter = DefaultCollapsibleTabsPagerAdapter,
  style,
  children,
}: CollapsibleTabsPagerProps) {
  const { tabs, initialIndex, controllerRef, onPagerIndexChange } =
    useCollapsibleTabsContextOrThrow('CollapsibleTabs.Pager');

  const pages = useMemo(() => {
    const elements: ReactElement[] = [];
    const names: (string | undefined)[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) {
        if (child != null && __DEV__) {
          console.warn(
            '[react-native-header-motion] CollapsibleTabs.Pager only renders <CollapsibleTabs.Tab /> children.'
          );
        }
        return;
      }

      const name = (child.props as { name?: string }).name;
      names.push(name);
      elements.push(
        cloneElement(child, { key: name ?? `tab-${elements.length}` })
      );
    });

    if (__DEV__) {
      const expected = tabs.map((tab) => tab.name);
      const matches =
        expected.length === names.length &&
        expected.every((name, index) => name === names[index]);
      if (!matches) {
        console.warn(
          `[react-native-header-motion] CollapsibleTabs.Pager children do not match the \`tabs\` prop. Expected [${expected.join(
            ', '
          )}], found [${names.join(', ')}].`
        );
      }
    }

    return elements;
  }, [children, tabs]);

  return (
    <Adapter
      initialIndex={initialIndex}
      onIndexChange={onPagerIndexChange}
      controllerRef={controllerRef}
      style={style}
    >
      {pages}
    </Adapter>
  );
}

export interface CollapsibleTabProps {
  /**
   * The tab's name from the `tabs` prop. It doubles as the default `scrollId`
   * for every header-motion scrollable rendered inside.
   */
  name: string;
  /** Style for the page container. */
  style?: StyleProp<ViewStyle>;
  /** The page content, typically a header-motion scrollable. */
  children?: ReactNode;
}

const tabStyles = StyleSheet.create({
  tab: {
    flex: 1,
  },
});

/**
 * One page of a `CollapsibleTabs.Pager`.
 *
 * Provides its `name` as the default `scrollId`, so any header-motion
 * scrollable inside — `Collapsible.ScrollView`, `Collapsible.FlatList`, or a
 * custom one from `createHeaderMotionScrollable()` — participates in the
 * shared header state without extra wiring.
 */
function CollapsibleTab({ name, style, children }: CollapsibleTabProps) {
  return (
    <View style={[tabStyles.tab, style]} collapsable={false}>
      <HeaderMotionScrollIdContext.Provider value={name}>
        {children}
      </HeaderMotionScrollIdContext.Provider>
    </View>
  );
}

export interface CollapsibleTabsBarProps {
  /** Style for the bar container. */
  style?: StyleProp<ViewStyle>;
  /** Style for each tab press target. */
  tabStyle?: StyleProp<ViewStyle>;
  /** Style for every tab label. */
  labelStyle?: StyleProp<TextStyle>;
  /** Style merged onto the active tab's label. */
  activeLabelStyle?: StyleProp<TextStyle>;
}

const barStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  activeLabel: {
    fontWeight: '700',
    opacity: 1,
  },
});

/**
 * Minimal, unstyled-by-design tab bar for `CollapsibleTabs`.
 *
 * Place it anywhere inside the header (or outside it). For a fully custom tab
 * bar, build your own component on top of `useCollapsibleTabs()` instead.
 */
function CollapsibleTabsBar({
  style,
  tabStyle,
  labelStyle,
  activeLabelStyle,
}: CollapsibleTabsBarProps) {
  const { tabs, activeTab, goTo } = useCollapsibleTabsContextOrThrow(
    'CollapsibleTabs.Bar'
  );

  return (
    <View style={[barStyles.bar, style]}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;

        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[barStyles.tab, tabStyle]}
            onPress={() => goTo(tab.name)}
          >
            <Text
              style={[
                barStyles.label,
                labelStyle,
                isActive && barStyles.activeLabel,
                isActive && activeLabelStyle,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Compound entrypoint for tabbed collapsible headers. See
 * `CollapsibleTabsRoot` for the full example.
 */
export const CollapsibleTabs = Object.assign(CollapsibleTabsRoot, {
  /** Renders the swipeable pages through a pager adapter. */
  Pager: CollapsibleTabsPager,
  /** One page; provides its `name` as the default `scrollId`. */
  Tab: CollapsibleTab,
  /** Minimal default tab bar. Build custom bars with `useCollapsibleTabs()`. */
  Bar: CollapsibleTabsBar,
});
