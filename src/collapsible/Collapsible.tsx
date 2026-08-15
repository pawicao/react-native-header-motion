import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type AnimatedProps,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Bridge } from '../components/Bridge';
import { FlatList } from '../components/FlatList';
import { Header, type HeaderProps } from '../components/Header';
import { HeaderDynamic } from '../components/HeaderDynamic';
import {
  HeaderMotionContextProvider,
  type HeaderMotionProps,
} from '../components/HeaderMotion';
import { NavigationBridge } from '../components/NavigationBridge';
import { ScrollView } from '../components/ScrollView';
import { useMotionProgress } from '../hooks/useMotionProgress';
import type { HeaderDynamicProps } from '../types';
import {
  CollapsiblePresetsContext,
  CollapsibleTabsContext,
  useCollapsiblePresetsOrThrow,
} from './context';
import {
  resolveCollapsiblePartStyle,
  resolveCollapsiblePresets,
} from './presets';
import type {
  CollapsibleHeaderState,
  CollapsiblePresetContext,
  CollapsiblePresetInput,
} from './types';

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

const EXPANDED_EDGE = 0.001;
const COLLAPSED_EDGE = 0.999;

export interface CollapsibleProps<T extends string = string>
  extends HeaderMotionProps<T> {
  /**
   * How the collapsing content should animate: a built-in preset name, a
   * configured preset from `CollapsiblePresets`, a custom preset created with
   * `createCollapsiblePreset()`, or an array of those to combine.
   *
   * @default 'collapse'
   */
  preset?: CollapsiblePresetInput;
  /**
   * Called when the header settles into a terminal state: `'collapsed'` when
   * `progress` reaches `1`, `'expanded'` when it returns to `0`.
   */
  onStateChange?: (state: CollapsibleHeaderState) => void;
}

function CollapsibleStateObserver({
  onStateChange,
}: {
  onStateChange: (state: CollapsibleHeaderState) => void;
}) {
  const { progress } = useMotionProgress();
  const callbackRef = useRef(onStateChange);
  useEffect(() => {
    callbackRef.current = onStateChange;
  });

  const emit = useCallback((state: CollapsibleHeaderState) => {
    callbackRef.current?.(state);
  }, []);

  const lastState = useSharedValue<CollapsibleHeaderState>('expanded');

  useAnimatedReaction(
    () => progress.get(),
    (value) => {
      const previous = lastState.get();
      if (value >= COLLAPSED_EDGE && previous !== 'collapsed') {
        lastState.set('collapsed');
        scheduleOnRN(emit, 'collapsed');
      } else if (value <= EXPANDED_EDGE && previous !== 'expanded') {
        lastState.set('expanded');
        scheduleOnRN(emit, 'expanded');
      }
    }
  );

  return null;
}

/**
 * High-level root for a collapsible header setup.
 *
 * It renders a `HeaderMotion` provider and shares the resolved `preset` with
 * the `Collapsible.*` parts composed inside — no visual output of its own.
 *
 * @template T - The type of scroll ID string
 */
function CollapsibleRoot<T extends string = string>({
  preset = 'collapse',
  onStateChange,
  children,
  ...headerMotionProps
}: CollapsibleProps<T>) {
  const presets = useMemo(() => resolveCollapsiblePresets(preset), [preset]);

  return (
    <HeaderMotionContextProvider {...headerMotionProps}>
      <CollapsiblePresetsContext.Provider value={presets}>
        {onStateChange ? (
          <CollapsibleStateObserver onStateChange={onStateChange} />
        ) : null}
        {children}
      </CollapsiblePresetsContext.Provider>
    </HeaderMotionContextProvider>
  );
}

export type CollapsibleHeaderProps = DistributiveOmit<
  Extract<HeaderProps, { asChild?: false | undefined }>,
  'asChild'
>;

/**
 * The header frame of a collapsible setup.
 *
 * Renders `HeaderMotion.Header` (so the total header height is measured
 * automatically) and slides itself up by the collapse distance as the user
 * scrolls. Preset `header` styles are merged on top of that intrinsic
 * transform.
 */
function CollapsibleHeaderPart({ style, ...rest }: CollapsibleHeaderProps) {
  const presets = useCollapsiblePresetsOrThrow('Collapsible.Header');
  const { progress, progressThreshold } = useMotionProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const context: CollapsiblePresetContext = {
      progress: progress.get(),
      progressThreshold: progressThreshold.get(),
    };
    const intrinsic: ViewStyle = {
      transform: [
        { translateY: -context.progress * context.progressThreshold },
      ],
    };

    return resolveCollapsiblePartStyle('header', intrinsic, presets, context);
  });

  return <Header {...rest} style={[style, animatedStyle]} />;
}

export type CollapsiblePinnedProps = AnimatedProps<ViewProps>;

/**
 * A header section that stays visually in place while the header collapses.
 *
 * Use it for content that must remain visible — a title row, actions, or a
 * search field. It counter-translates against the header frame's slide, and
 * preset `pinned` styles are merged on top.
 */
function CollapsiblePinned({ style, ...rest }: CollapsiblePinnedProps) {
  const presets = useCollapsiblePresetsOrThrow('Collapsible.Pinned');
  const { progress, progressThreshold } = useMotionProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const context: CollapsiblePresetContext = {
      progress: progress.get(),
      progressThreshold: progressThreshold.get(),
    };
    const intrinsic: ViewStyle = {
      transform: [{ translateY: context.progress * context.progressThreshold }],
    };

    return resolveCollapsiblePartStyle('pinned', intrinsic, presets, context);
  });

  return <Animated.View {...rest} style={[style, animatedStyle]} />;
}

export type CollapsibleDynamicProps = DistributiveOmit<
  Extract<HeaderDynamicProps, { asChild?: false | undefined }>,
  'asChild'
> & {
  /** Style for the inner content view that the preset effects animate. */
  contentStyle?: AnimatedProps<ViewProps>['style'];
};

const dynamicStyles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});

/**
 * The collapsing section of the header.
 *
 * Renders `HeaderMotion.Header.Dynamic`, so its measured height defines the
 * collapse distance. The children are wrapped in an inner view that receives
 * the preset's content effect (fade, parallax, scale, ...), while this
 * wrapper clips the content (`overflow: 'hidden'`) and receives the preset's
 * `dynamic` styles.
 */
function CollapsibleDynamic({
  style,
  contentStyle,
  children,
  ...rest
}: CollapsibleDynamicProps) {
  const presets = useCollapsiblePresetsOrThrow('Collapsible.Dynamic');
  const { progress, progressThreshold } = useMotionProgress();

  const wrapperStyle = useAnimatedStyle(() => {
    const context: CollapsiblePresetContext = {
      progress: progress.get(),
      progressThreshold: progressThreshold.get(),
    };

    return resolveCollapsiblePartStyle('dynamic', undefined, presets, context);
  });

  const innerStyle = useAnimatedStyle(() => {
    const context: CollapsiblePresetContext = {
      progress: progress.get(),
      progressThreshold: progressThreshold.get(),
    };

    return resolveCollapsiblePartStyle(
      'dynamicContent',
      undefined,
      presets,
      context
    );
  });

  return (
    <HeaderDynamic {...rest} style={[dynamicStyles.clip, style, wrapperStyle]}>
      <Animated.View style={[contentStyle, innerStyle]}>
        {children}
      </Animated.View>
    </HeaderDynamic>
  );
}

export interface CollapsibleNavigationHeaderRenderProps {
  /**
   * Places the finished header element into your navigator.
   *
   * The element already carries the HeaderMotion, preset, and tabs contexts
   * across the tree boundary, so it can be rendered anywhere — most commonly
   * inside a navigation library's `header` option.
   */
  render: (header: ReactElement) => ReactNode;
}

export type CollapsibleNavigationHeaderProps = CollapsibleHeaderProps &
  CollapsibleNavigationHeaderRenderProps;

/**
 * A collapsible header rendered by a navigation library.
 *
 * Compose the header content as children exactly like in `Collapsible.Header`
 * and use `render` to mount the prepared element into your navigator. This
 * replaces the manual `Bridge` / `NavigationBridge` wiring of the low-level
 * API.
 *
 * @example
 * ```tsx
 * <Collapsible.NavigationHeader
 *   render={(header) => <Stack.Screen options={{ header: () => header }} />}
 * >
 *   <Collapsible.Pinned>{...}</Collapsible.Pinned>
 *   <Collapsible.Dynamic>{...}</Collapsible.Dynamic>
 * </Collapsible.NavigationHeader>
 * ```
 */
function CollapsibleNavigationHeader({
  render,
  ...headerProps
}: CollapsibleNavigationHeaderProps) {
  const presets = useCollapsiblePresetsOrThrow('Collapsible.NavigationHeader');
  const tabsContext = useContext(CollapsibleTabsContext);

  return (
    <Bridge>
      {(value) =>
        render(
          <NavigationBridge value={value}>
            <CollapsiblePresetsContext.Provider value={presets}>
              <CollapsibleTabsContext.Provider value={tabsContext}>
                <CollapsibleHeaderPart {...headerProps} />
              </CollapsibleTabsContext.Provider>
            </CollapsiblePresetsContext.Provider>
          </NavigationBridge>
        )
      }
    </Bridge>
  );
}

/**
 * High-level, preset-driven collapsible header built on top of the
 * `HeaderMotion` primitives.
 *
 * Compose the header from explicit parts — the same composition pattern as
 * the low-level API, with the animation choreography handled for you:
 *
 * @example
 * ```tsx
 * <Collapsible preset="parallax">
 *   <Collapsible.NavigationHeader
 *     render={(header) => <Stack.Screen options={{ header: () => header }} />}
 *   >
 *     <Collapsible.Pinned>
 *       <TitleRow />
 *     </Collapsible.Pinned>
 *     <Collapsible.Dynamic>
 *       <Hero />
 *     </Collapsible.Dynamic>
 *   </Collapsible.NavigationHeader>
 *   <Collapsible.ScrollView>{content}</Collapsible.ScrollView>
 * </Collapsible>
 * ```
 */
export const Collapsible = Object.assign(CollapsibleRoot, {
  /**
   * Header frame: measures the total header height and slides up while
   * collapsing. Compose `Collapsible.Pinned` and `Collapsible.Dynamic`
   * (plus any plain views) inside it.
   */
  Header: CollapsibleHeaderPart,
  /** Header section that stays visually in place while the header collapses. */
  Pinned: CollapsiblePinned,
  /**
   * The collapsing header section. Its measured height defines the collapse
   * distance and the active preset animates its content.
   */
  Dynamic: CollapsibleDynamic,
  /**
   * Navigation-rendered variant of `Collapsible.Header` — bridges every
   * collapsible context across the React tree boundary for you.
   */
  NavigationHeader: CollapsibleNavigationHeader,
  /** Pre-wired `Animated.ScrollView` — the same component as `HeaderMotion.ScrollView`. */
  ScrollView: ScrollView,
  /** Pre-wired `Animated.FlatList` — the same component as `HeaderMotion.FlatList`. */
  FlatList: FlatList,
});
