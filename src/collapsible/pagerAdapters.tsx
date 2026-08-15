import {
  Children,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentRef,
  type ComponentType,
  type ReactNode,
  type Ref,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * Imperative surface a pager adapter must expose so `CollapsibleTabs` can
 * change pages programmatically (for example from a tab-bar press).
 */
export interface CollapsibleTabsPagerController {
  /** Animates the pager to the page at `index`. */
  setIndex: (index: number) => void;
}

/**
 * Props every pager adapter receives from `CollapsibleTabs.Pager`.
 *
 * An adapter renders `children` (one element per tab, in order), reports
 * user-driven page changes through `onIndexChange`, and assigns a
 * {@link CollapsibleTabsPagerController} to `controllerRef` for programmatic
 * page changes.
 */
export interface CollapsibleTabsPagerAdapterProps {
  /** Index of the page that should be shown initially. */
  initialIndex: number;
  /** Reports that the user moved the pager to the page at `index`. */
  onIndexChange: (index: number) => void;
  /** Receives the adapter's imperative controller. */
  controllerRef: Ref<CollapsibleTabsPagerController | null>;
  /** Style for the pager container. Defaults to `flex: 1` when omitted. */
  style?: StyleProp<ViewStyle>;
  /** The tab pages, one element per tab, in tab order. */
  children: ReactNode;
}

/**
 * A pager engine for `CollapsibleTabs.Pager`.
 *
 * The library ships a dependency-free default (a paging horizontal
 * `ScrollView`) and `createPagerViewAdapter()` for `react-native-pager-view`.
 * Provide your own adapter to plug in any other pager implementation.
 */
export type CollapsibleTabsPagerAdapter =
  ComponentType<CollapsibleTabsPagerAdapterProps>;

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    height: '100%',
  },
});

/**
 * Default pager engine: a paging horizontal `ScrollView`.
 *
 * It has no dependencies beyond React Native, supports swiping between pages
 * and programmatic page changes, and keeps every page mounted so scroll
 * positions are preserved. For native pager behavior, pass
 * `createPagerViewAdapter(PagerView)` to `CollapsibleTabs.Pager` instead.
 */
export function DefaultCollapsibleTabsPagerAdapter({
  initialIndex,
  onIndexChange,
  controllerRef,
  style,
  children,
}: CollapsibleTabsPagerAdapterProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(windowWidth);
  const pageWidthRef = useRef(pageWidth);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    pageWidthRef.current = pageWidth;
  }, [pageWidth]);

  useImperativeHandle(
    controllerRef,
    () => ({
      setIndex: (index: number) => {
        scrollRef.current?.scrollTo({
          x: index * pageWidthRef.current,
          animated: true,
        });
      },
    }),
    []
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setPageWidth((previous) => (previous === width ? previous : width));
    }
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const width = pageWidthRef.current;
      if (width <= 0) {
        return;
      }

      onIndexChange(Math.round(e.nativeEvent.contentOffset.x / width));
    },
    [onIndexChange]
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentOffset={{ x: initialIndex * pageWidth, y: 0 }}
      onLayout={handleLayout}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      style={[styles.pager, style]}
    >
      {Children.map(children, (child) => (
        <View style={[styles.page, { width: pageWidth }]}>{child}</View>
      ))}
    </ScrollView>
  );
}

/**
 * Structural subset of `react-native-pager-view`'s props that the adapter
 * relies on. Typed loosely on purpose so the library does not depend on
 * `react-native-pager-view`'s types.
 */
export interface CollapsiblePagerViewLikeProps {
  ref?: Ref<any>;
  style?: StyleProp<ViewStyle>;
  initialPage?: number;
  onPageSelected?: (event: {
    nativeEvent: {
      position: number;
    };
  }) => void;
  children?: ReactNode;
}

/**
 * Creates a `CollapsibleTabs.Pager` adapter backed by
 * `react-native-pager-view`.
 *
 * The component is passed in by the caller so the library never imports
 * `react-native-pager-view` itself — it stays a regular dependency of *your*
 * app, not of `react-native-header-motion`.
 *
 * @example
 * ```tsx
 * import PagerView from 'react-native-pager-view';
 * import { createPagerViewAdapter } from 'react-native-header-motion';
 *
 * const pagerAdapter = createPagerViewAdapter(PagerView);
 *
 * <CollapsibleTabs.Pager adapter={pagerAdapter}>
 * ```
 */
export function createPagerViewAdapter(
  PagerViewComponent: ComponentType<CollapsiblePagerViewLikeProps>
): CollapsibleTabsPagerAdapter {
  function PagerViewAdapter({
    initialIndex,
    onIndexChange,
    controllerRef,
    style,
    children,
  }: CollapsibleTabsPagerAdapterProps) {
    const pagerRef = useRef<{ setPage?: (index: number) => void } | null>(null);

    useImperativeHandle(
      controllerRef,
      () => ({
        setIndex: (index: number) => {
          pagerRef.current?.setPage?.(index);
        },
      }),
      []
    );

    return (
      <PagerViewComponent
        ref={pagerRef}
        style={[styles.pager, style]}
        initialPage={initialIndex}
        onPageSelected={(e) => onIndexChange(e.nativeEvent.position)}
      >
        {children}
      </PagerViewComponent>
    );
  }

  PagerViewAdapter.displayName = 'CollapsibleTabs.PagerViewAdapter';
  return PagerViewAdapter;
}
