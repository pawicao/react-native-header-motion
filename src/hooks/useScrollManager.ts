import { useContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelAnimation,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
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

/**
 * Hook that manages scroll tracking and synchronization for header animations.
 * Returns props to apply to scrollable components and additional values that help with adjusting styling of the scrollables to header's dimensions.
 *
 * This hook handles:
 * - Scroll position tracking
 * - Synchronization between multiple scroll views (when using multiple scroll IDs)
 * - Content container minimum height calculations for cases where one of the tracked scrollables does not take enough space to reach the progress threshold/
 *
 * Must be used within a HeaderMotion component.
 *
 * @param scrollId - Optional unique identifier for the related scrollable.
 *                   Use when you have multiple scrollables (e.g., in tabs).
 * @param options - Optional configuration object.
 * @param options.animatedRef - Optional animated ref to use instead of creating one internally.
 *                              Useful when you need access to the scroll view ref from outside.
 * @returns Configuration object containing:
 * - `scrollableProps`: Props to apply to scrollable component (onScroll, ref)
 * - `headerMotionContext`: Header context values (originalHeaderHeight, minHeightContentContainerStyle)
 *
 * @throws Error if used outside of a HeaderMotion component
 *
 * @example
 * ```tsx
 * function CustomScrollComponent() {
 *   const { scrollableProps, headerMotionContext } = useScrollManager('myScroll');
 *
 *   return (
 *     <CustomScrollView {...scrollableProps}>
 *       <View style={{ paddingTop: headerMotionContext.originalHeaderHeight }}>
 *         Content
 *       </View>
 *     </CustomScrollView>
 *   );
 * }
 * ```
 */
export interface UseScrollManagerOptions<TRef extends InstanceOrElement = any>
  extends Omit<ResolveRefreshControlOptions, 'progressViewOffset'>,
    ConsumerScrollEventHandlers {
  /**
   * Optional animated ref to use instead of creating one internally.
   * Useful when you need access to the scroll view ref from outside.
   */
  animatedRef?: AnimatedRef<TRef>;
  /**
   * Optional refresh progress offset override.
   * When provided, it takes precedence over the automatic offset based on header height.
   */
  progressViewOffset?: ResolveRefreshControlOptions['progressViewOffset'];
  /**
   * Experimental: opt-in fallback for short content that cannot scroll far enough
   * to fully collapse the header.
   */
  ensureScrollableContentMinHeight?: boolean;
}

export function useScrollManager<TRef extends InstanceOrElement = any>(
  scrollId?: string,
  options?: UseScrollManagerOptions<TRef>
): ScrollManagerConfig<TRef> {
  const ctxValue = useContext(HeaderMotionContext);
  if (!ctxValue) {
    throw new Error(
      'useScrollManager must be used within a HeaderMotion component'
    );
  }

  const {
    scrollValues,
    progress,
    activeScrollId,
    progressThreshold,
    originalHeaderHeight,
    scrollToRef,
    headerPanMomentumOffset,
  } = ctxValue;
  const id = scrollId ?? DEFAULT_SCROLL_ID;

  const localRef = useAnimatedRef<TRef>();
  const animatedRef = options?.animatedRef ?? localRef;
  const scrollContainerHeightRef = useRef(0);
  const [contentContainerMinHeight, setContentContainerMinHeight] = useState<
    number | undefined
  >(undefined);
  const ensureScrollableContentMinHeight =
    options?.ensureScrollableContentMinHeight ?? false;
  const refreshControl = options?.refreshControl;
  const refreshing = options?.refreshing;
  const onRefresh = options?.onRefresh;
  const { onScroll, onBeginDrag, onEndDrag, onMomentumBegin, onMomentumEnd } =
    useConsumerScrollHandlers({
      onScroll: options?.onScroll,
      onScrollBeginDrag: options?.onScrollBeginDrag,
      onScrollEndDrag: options?.onScrollEndDrag,
      onMomentumScrollBegin: options?.onMomentumScrollBegin,
      onMomentumScrollEnd: options?.onMomentumScrollEnd,
    });
  const progressViewOffset =
    options?.progressViewOffset ?? originalHeaderHeight;

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (!ensureScrollableContentMinHeight) {
        return;
      }

      const nextHeight = e.nativeEvent.layout.height;
      scrollContainerHeightRef.current = nextHeight;
      scheduleOnUI((height: number) => {
        'worklet';
        const nextMinHeight = height + progressThreshold.get();
        scheduleOnRN(setContentContainerMinHeight, nextMinHeight);
      }, nextHeight);
    },
    [ensureScrollableContentMinHeight, progressThreshold]
  );

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
  }, [scrollValues, id]);

  useAnimatedReaction(
    () => progressThreshold.get(),
    (threshold, prevThreshold) => {
      if (
        !ensureScrollableContentMinHeight ||
        prevThreshold === null ||
        prevThreshold === threshold
      ) {
        return;
      }

      scheduleOnRN((nextThreshold: number) => {
        const currentHeight = scrollContainerHeightRef.current;
        if (currentHeight <= 0) {
          return;
        }

        const nextMinHeight = currentHeight + nextThreshold;
        setContentContainerMinHeight(nextMinHeight);
      }, threshold);
    }
  );

  useAnimatedReaction(
    () => progress.value,
    (newProgress, oldProgress) => {
      // Only sync inactive scroll views when we have multiple tabs being tracked
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

      // When the header is fully collapsed and the user is scrolled past the
      // threshold, progress is mathematically guaranteed to stay at 1:
      //   min = newCurrent - threshold  →  (newCurrent - min) / threshold = 1
      // In this case we update the values directly via .get() instead of
      // .modify(), which avoids triggering the reactive cascade (progress
      // re-derivation, animated reactions, animated styles). The values are
      // still updated in-place for tab synchronization correctness.
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
    [scrollValues, id, activeScrollId, progressThreshold, onScroll]
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

  const animatedOnScroll = useAnimatedScrollHandler({
    onBeginDrag: handleBeginDrag,
    onScroll: handleScroll,
    onEndDrag,
    onMomentumBegin,
    onMomentumEnd,
  });

  const resolvedRefreshControl = resolveRefreshControl({
    refreshControl,
    refreshing,
    onRefresh,
    progressViewOffset,
  });

  const scrollableProps = {
    onScroll: useScrollHandlerComposition(animatedOnScroll, options?.onScroll),
    onLayout: ensureScrollableContentMinHeight ? handleLayout : undefined,
    ref: animatedRef,
    refreshControl: resolvedRefreshControl,
  };
  const headerMotionContext = {
    originalHeaderHeight,
    contentContainerMinHeight,
  };

  return { scrollableProps, headerMotionContext };
}
