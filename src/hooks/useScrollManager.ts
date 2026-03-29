import {
  useContext,
  useCallback,
  useEffect,
  useState,
  type ContextType,
} from 'react';
import {
  cancelAnimation,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  type AnimatedRef,
  type ScrollHandler,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { HeaderMotionContext } from '../context';
import type { ScrollManagerConfig, ScrollHandlerContext } from '../types';
import type { LayoutChangeEvent } from 'react-native';
import {
  resolveRefreshControl,
  DEFAULT_SCROLL_ID,
  ensureScrollValueRegistered,
  warnIfMissingActiveScrollId,
  type ResolveRefreshControlOptions,
} from '../utils';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';
import {
  useConsumerScrollHandlers,
  useScrollHandlerComposition,
  type ConsumerScrollEventHandlers,
} from './useConsumerScrollHandlers';

const SCROLL_TOLERANCE = 0.5;

type ScrollManagerContextValue = NonNullable<
  ContextType<typeof HeaderMotionContext>
>;

interface MinHeightOptions {
  enabled: boolean;
}

interface SynchronizationOptions<TRef extends InstanceOrElement> {
  animatedRef: AnimatedRef<TRef>;
  id: string;
}

interface ScrollHandlersOptions {
  consumerHandlers: ConsumerScrollEventHandlers;
  id: string;
}

function useScrollManagerContext(): ScrollManagerContextValue {
  const ctxValue = useContext(HeaderMotionContext);
  if (!ctxValue) {
    throw new Error(
      'useScrollManager must be used within a HeaderMotion component'
    );
  }

  return ctxValue;
}

function useScrollManagerContentMinHeight({ enabled }: MinHeightOptions) {
  const { progressThreshold } = useScrollManagerContext();
  const preservedScrollContainerHeight = useSharedValue(0);
  const [contentContainerMinHeight, setContentContainerMinHeight] = useState<
    number | undefined
  >(undefined);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!enabled) {
        return;
      }

      const nextHeight = e.nativeEvent.layout.height;
      scheduleOnUI((height: number) => {
        'worklet';
        preservedScrollContainerHeight.set(height);
        const nextMinHeight = height + progressThreshold.get();
        scheduleOnRN(setContentContainerMinHeight, nextMinHeight);
      }, nextHeight);
    },
    [enabled, preservedScrollContainerHeight, progressThreshold]
  );

  useAnimatedReaction(
    () => progressThreshold.get(),
    (threshold, previousThreshold) => {
      if (
        !enabled ||
        previousThreshold === null ||
        previousThreshold === threshold
      ) {
        return;
      }

      const currentHeight = preservedScrollContainerHeight.get();
      if (currentHeight <= 0) {
        return;
      }

      const nextMinHeight = currentHeight + threshold;
      scheduleOnRN(setContentContainerMinHeight, nextMinHeight);
    }
  );

  return {
    contentContainerMinHeight,
    handleLayout: enabled ? handleLayout : undefined,
  };
}

function useScrollManagerSynchronization<TRef extends InstanceOrElement>({
  animatedRef,
  id,
}: SynchronizationOptions<TRef>) {
  const {
    activeScrollId,
    progress,
    progressThreshold,
    scrollToRef,
    scrollValues,
  } = useScrollManagerContext();

  useAnimatedReaction(
    () => activeScrollId?.get(),
    (activeId) => {
      const currentValues = ensureScrollValueRegistered(scrollValues, id);
      warnIfMissingActiveScrollId(currentValues, id, activeId);

      if (!activeId || activeId === id) {
        // TODO: Could we just be passing current scrollRef instead of the entire function?
        scrollToRef.current = (y, scrollOptions = {}) => {
          'worklet';
          const { isValueDelta = true, animated = false } = scrollOptions;
          const newY = isValueDelta ? scrollValues.get()[id]!.current - y : y;
          scrollTo(animatedRef, 0, newY, animated);
        };
      }
    }
  );

  useEffect(() => {
    return () => {
      scheduleOnUI((scrollIdToDelete) => {
        scrollValues.modify((value) => {
          'worklet';
          delete value[scrollIdToDelete];
          return value;
        });
      }, id);
    };
  }, [id, scrollValues]);

  useAnimatedReaction(
    () => progress.value,
    (newProgress, oldProgress) => {
      const currentActiveScrollId = activeScrollId?.get();
      if (
        !currentActiveScrollId ||
        id === currentActiveScrollId ||
        oldProgress === null
      ) {
        return;
      }

      ensureScrollValueRegistered(scrollValues, id);

      let newCur = -1;
      const threshold = progressThreshold.get();

      scrollValues.modify((value) => {
        const scrollValue = value[id];
        if (!scrollValue) {
          return value;
        }

        const progressDiff = oldProgress - newProgress;
        newCur = scrollValue.current - progressDiff * threshold;
        const newMin = newCur - newProgress * threshold;
        scrollValue.current = newCur;
        scrollValue.min = newMin;

        return value;
      });

      if (newCur >= 0) {
        scrollTo(animatedRef, 0, newCur, false);
      }
    }
  );
}

function useScrollManagerHandlers({
  consumerHandlers,
  id,
}: ScrollHandlersOptions) {
  const {
    activeScrollId,
    headerPanMomentumOffset,
    progressThreshold,
    scrollValues,
  } = useScrollManagerContext();
  const { onScroll, onBeginDrag, onEndDrag, onMomentumBegin, onMomentumEnd } =
    useConsumerScrollHandlers(consumerHandlers);

  const handleScroll = useCallback<ScrollHandler<ScrollHandlerContext>>(
    (e, ctx) => {
      'worklet';
      onScroll?.(e);

      const newCurrent = e.contentOffset.y;

      if (
        ctx.lastOffset !== undefined &&
        Math.abs(ctx.lastOffset - newCurrent) < SCROLL_TOLERANCE
      ) {
        return;
      }
      ctx.lastOffset = newCurrent;

      const threshold = progressThreshold.get();
      const values = scrollValues.get();
      const scrollValue = values[id];

      if (!scrollValue) {
        return;
      }

      const activeScrollIdValue = activeScrollId?.get();
      if (activeScrollIdValue && activeScrollIdValue !== id) {
        return;
      }

      const oldCurrent = scrollValue.current;
      const oldMin = scrollValue.min;
      const isCollapsed = oldCurrent >= oldMin + threshold - 0.001;

      if (isCollapsed && newCurrent >= threshold) {
        scrollValue.current = newCurrent;
        scrollValue.min = newCurrent - threshold;
        return;
      }

      scrollValues.modify((value) => {
        if (!value[id]) {
          return value;
        }

        value[id].current = newCurrent;

        if (isCollapsed) {
          value[id].min = Math.max(0, newCurrent - threshold);
        }

        return value;
      });
    },
    [activeScrollId, id, onScroll, progressThreshold, scrollValues]
  );

  const handleBeginDrag = useCallback<ScrollHandler<ScrollHandlerContext>>(
    (e) => {
      'worklet';
      onBeginDrag?.(e);

      if (headerPanMomentumOffset.get() === null) {
        return;
      }

      cancelAnimation(headerPanMomentumOffset);
      headerPanMomentumOffset.set(null);
    },
    [headerPanMomentumOffset, onBeginDrag]
  );

  return useAnimatedScrollHandler({
    onBeginDrag: handleBeginDrag,
    onScroll: handleScroll,
    onEndDrag,
    onMomentumBegin,
    onMomentumEnd,
  });
}
export interface UseScrollManagerOptions<TRef extends InstanceOrElement = any>
  extends Omit<ResolveRefreshControlOptions, 'progressViewOffset'>,
    ConsumerScrollEventHandlers {
  /**
   * Animated ref for the managed scrollable.
   *
   * Provide this when the caller also needs imperative access to the same
   * scrollable instance. Otherwise the hook creates one internally.
   */
  animatedRef?: AnimatedRef<TRef>;
  /**
   * Overrides the refresh indicator offset.
   *
   * By default, HeaderMotion derives this from the measured header height so
   * pull-to-refresh starts below the header. Override it only when you need a
   * custom refresh placement.
   */
  progressViewOffset?: ResolveRefreshControlOptions['progressViewOffset'];
  /**
   * Ensures short content can still scroll far enough to fully collapse the
   * header.
   *
   * **Experimental: this relies on extra layout measurement and may still be
   * refined.**
   *
   * Enable this when your content is sometimes shorter than the viewport and
   * you still want the header to reach the collapsed state.
   */
  ensureScrollableContentMinHeight?: boolean;
}

/**
 * Wires a custom scrollable into HeaderMotion.
 *
 * Most code should not use this hook directly.
 *
 * **Prefer `createHeaderMotionScrollable()` whenever possible.** It gives
 * you the same integration in a reusable component wrapper with less manual
 * wiring. Reach for `useScrollManager()` only in more complex cases where the
 * factory API is not enough, for example when a third-party scrollable needs
 * highly custom composition.
 *
 * It returns two things:
 * - `scrollableProps`: the event handlers / ref / refresh-control props that
 *   should go on the scrollable itself
 * - `headerMotionContext`: layout values you can use to offset the content
 *   below the measured header
 *
 * In multi-scroll setups, pass a unique `scrollId` for each scrollable.
 * In single-scroll setups, you usually do not need one.
 *
 * If you need the same fallback behavior but prefer render-prop composition
 * over a hook, use `HeaderMotion.ScrollManager`.
 *
 * @param scrollId Optional unique identifier for the managed scrollable.
 * @param options Optional configuration for refs, refresh handling, user
 * scroll callbacks, and short-content fallback behavior.
 * @returns Object containing:
 * - `scrollableProps`: props to spread onto the scrollable (`ref`, managed
 *   `onScroll`, optional `onLayout`, and resolved `refreshControl`)
 * - `headerMotionContext`: layout values for offsetting the content container
 *   (`originalHeaderHeight` and optional `contentContainerMinHeight`)
 *
 * @example
 * ```tsx
 * function CustomScrollComponent() {
 *   const { scrollableProps, headerMotionContext } = useScrollManager('myScroll');
 *
 *   return (
 *     <CustomScrollView {...scrollableProps}>
 *       <View
 *         style={{
 *           paddingTop: headerMotionContext.originalHeaderHeight,
 *           minHeight: headerMotionContext.contentContainerMinHeight,
 *         }}
 *       >
 *         Content
 *       </View>
 *     </CustomScrollView>
 *   );
 * }
 * ```
 */
export function useScrollManager<TRef extends InstanceOrElement = any>(
  scrollId?: string,
  options?: UseScrollManagerOptions<TRef>
): ScrollManagerConfig<TRef> {
  const { originalHeaderHeight } = useScrollManagerContext();
  const id = scrollId ?? DEFAULT_SCROLL_ID;

  const ensureScrollableContentMinHeight =
    options?.ensureScrollableContentMinHeight ?? false;
  const refreshControl = options?.refreshControl;
  const refreshing = options?.refreshing;
  const onRefresh = options?.onRefresh;
  const progressViewOffset =
    options?.progressViewOffset ?? originalHeaderHeight;

  const localRef = useAnimatedRef<TRef>();
  const animatedRef = options?.animatedRef ?? localRef;

  const { contentContainerMinHeight, handleLayout } =
    useScrollManagerContentMinHeight({
      enabled: ensureScrollableContentMinHeight,
    });

  useScrollManagerSynchronization({
    id,
    animatedRef,
  });

  const animatedOnScroll = useScrollManagerHandlers({
    id,
    consumerHandlers: {
      onScroll: options?.onScroll,
      onScrollBeginDrag: options?.onScrollBeginDrag,
      onScrollEndDrag: options?.onScrollEndDrag,
      onMomentumScrollBegin: options?.onMomentumScrollBegin,
      onMomentumScrollEnd: options?.onMomentumScrollEnd,
    },
  });

  const resolvedRefreshControl = resolveRefreshControl({
    refreshControl,
    refreshing,
    onRefresh,
    progressViewOffset,
  });

  const scrollableProps = {
    onScroll: useScrollHandlerComposition(animatedOnScroll, options?.onScroll),
    onLayout: handleLayout,
    ref: animatedRef,
    refreshControl: resolvedRefreshControl,
  };
  const headerMotionContext = {
    originalHeaderHeight,
    contentContainerMinHeight,
  };

  return { scrollableProps, headerMotionContext };
}
