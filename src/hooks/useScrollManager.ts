import { useContext, useCallback, useEffect } from 'react';
import {
  measure,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type ScrollHandler,
} from 'react-native-reanimated';
import { RuntimeKind, scheduleOnUI } from 'react-native-worklets';
import { HeaderMotionContext } from '../context';
import type { ScrollManagerConfig, ScrollValues } from '../types';
import { DEFAULT_SCROLL_ID, getInitialScrollValue } from '../utils';

const INACTIVE_SYNC_PROGRESS_STEP = 0.01;

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
 * @returns Configuration object containing:
 * - `scrollableProps`: Props to apply to scrollable component (onScroll, scrollEventThrottle, ref)
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
export function useScrollManager(scrollId?: string): ScrollManagerConfig {
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
  } = ctxValue;
  const id = scrollId ?? DEFAULT_SCROLL_ID;

  const animatedRef = useAnimatedRef<any>(); // TODO: better typing
  const inactiveSyncSignal = useSharedValue(0);
  const lastSyncedInactiveProgress = useSharedValue<number | null>(null);

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
    () => ({
      progress: progress.value,
      inactiveSyncSignal: inactiveSyncSignal.get(),
    }),
    (newValues, prevValues) => {
      const { progress: newProgress, inactiveSyncSignal: newInactiveSyncSignal } =
        newValues;
      const hasManualSyncRequest =
        prevValues !== null &&
        newInactiveSyncSignal !== prevValues.inactiveSyncSignal;

      // Only sync inactive scroll views when we have multiple tabs being tracked
      const currentActiveScrollId = activeScrollId?.get();
      if (!currentActiveScrollId || id === currentActiveScrollId) {
        lastSyncedInactiveProgress.set(null);
        return;
      }

      if (!scrollValues.get()[id]) {
        scrollValues.modify((value) => {
          (value as ScrollValues)[id] = getInitialScrollValue();
          return value;
        });
      }

      let newCur = -1;
      const threshold = progressThreshold.get();
      if (!Number.isFinite(threshold) || threshold <= 0) {
        return;
      }

      scrollValues.modify((value) => {
        let scrollValue = value[id];
        if (!scrollValue) {
          (value as ScrollValues)[id] = getInitialScrollValue();
          scrollValue = value[id]!;
        }

        const initialProgress =
          (scrollValue.current - scrollValue.min) / threshold;
        const sourceProgress =
          lastSyncedInactiveProgress.get() ?? initialProgress;
        const progressDiff = sourceProgress - newProgress;

        if (
          !hasManualSyncRequest &&
          Math.abs(progressDiff) < INACTIVE_SYNC_PROGRESS_STEP
        ) {
          return value;
        }

        newCur = scrollValue.current - progressDiff * threshold;
        const newMin = newCur - newProgress * threshold;
        scrollValue.current = newCur;
        scrollValue.min = newMin;
        lastSyncedInactiveProgress.set(newProgress);

        return value;
      });

      if (newCur >= 0) {
        scrollTo(animatedRef, 0, newCur, false);
      }
    }
  );

  const requestInactiveSync = useCallback(() => {
    'worklet';
    const activeScrollIdValue = activeScrollId?.get();
    if (activeScrollIdValue && activeScrollIdValue !== id) {
      return;
    }

    inactiveSyncSignal.set(inactiveSyncSignal.get() + 1);
  }, [activeScrollId, id, inactiveSyncSignal]);

  const scrollHandler = useCallback<ScrollHandler>(
    (e) => {
      'worklet';
      const threshold = progressThreshold.get();

      scrollValues.modify((value) => {
        if (!value[id]) {
          return value;
        }

        const activeScrollIdValue = activeScrollId?.get();
        if (activeScrollIdValue && activeScrollIdValue !== id) {
          return value;
        }

        const oldCurrent = value[id].current;
        const oldMin = value[id].min;
        const isCollapsed = oldCurrent >= oldMin + threshold - 0.001;

        const newCurrent = e.contentOffset.y;
        value[id].current = newCurrent;

        if (isCollapsed) {
          value[id].min = Math.max(0, newCurrent - threshold);
        }

        return value;
      });
    },
    [scrollValues, id, activeScrollId, progressThreshold]
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: scrollHandler,
    onEndDrag: requestInactiveSync,
    onMomentumEnd: requestInactiveSync,
  });

  const minHeightContentContainerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();

    if (globalThis.__RUNTIME_KIND === RuntimeKind.ReactNative) {
      return {};
    }

    const measurement = measure(animatedRef);

    if (!measurement) {
      return {};
    }

    return {
      minHeight: measurement.height + threshold,
    };
  });

  const scrollableProps = {
    onScroll,
    scrollEventThrottle: 16,
    ref: animatedRef,
  };
  const headerMotionContext = {
    originalHeaderHeight,
    minHeightContentContainerStyle,
  };

  return { scrollableProps, headerMotionContext };
}
