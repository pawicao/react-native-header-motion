import {
  useContext,
  useCallback,
  useEffect,
  useMemo,
  type ReactElement,
} from 'react';
import type { RefreshControlProps } from 'react-native';
import {
  measure,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  type AnimatedRef,
  type ScrollHandler,
} from 'react-native-reanimated';
import { RuntimeKind, scheduleOnUI } from 'react-native-worklets';
import { HeaderMotionContext } from '../context';
import type { ScrollManagerConfig, ScrollValues } from '../types';
import { DEFAULT_SCROLL_ID, getInitialScrollValue } from '../utils';
import { resolveRefreshControl } from './refreshControl';

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
export interface UseScrollManagerOptions {
  /**
   * Optional animated ref to use instead of creating one internally.
   * Useful when you need access to the scroll view ref from outside.
   */
  animatedRef?: AnimatedRef<any>;
  refreshControl?: ReactElement<RefreshControlProps>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function useScrollManager(
  scrollId?: string,
  options?: UseScrollManagerOptions
): ScrollManagerConfig {
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

  const localRef = useAnimatedRef<any>(); // TODO: better typing
  const animatedRef = options?.animatedRef ?? localRef;
  const refreshControl = options?.refreshControl;
  const refreshing = options?.refreshing;
  const onRefresh = options?.onRefresh;

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
    () => progress.value,
    (newProgress, oldProgress) => {
      // FUTURE: If really needed for, can use other scroll handlers to only do this either on scroll end or between scroll end and momentum end in onScroll (keep context in shared value)
      // Only sync inactive scroll views when we have multiple tabs being tracked
      const currentActiveScrollId = activeScrollId?.get();
      if (
        !currentActiveScrollId ||
        id === currentActiveScrollId ||
        oldProgress === null
      ) {
        return;
      }

      if (!scrollValues.get()[id]) {
        scrollValues.modify((value) => {
          (value as ScrollValues)[id] = getInitialScrollValue();
          return value;
        });
      }

      let newCur = -1;

      scrollValues.modify((value) => {
        let scrollValue = value[id];
        if (!scrollValue) {
          (value as ScrollValues)[id] = getInitialScrollValue();
          scrollValue = value[id]!;
        }

        const progressDiff = oldProgress - newProgress;
        newCur = scrollValue.current - progressDiff * progressThreshold;
        const newMin = newCur - newProgress * progressThreshold;
        scrollValue.current = newCur;
        scrollValue.min = newMin;

        return value;
      });

      if (newCur >= 0) {
        scrollTo(animatedRef, 0, newCur, false);
      }
    }
  );

  const scrollHandler = useCallback<ScrollHandler>(
    (e) => {
      'worklet';

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
        const isCollapsed = oldCurrent >= oldMin + progressThreshold - 0.001;

        const newCurrent = e.contentOffset.y;
        value[id].current = newCurrent;

        if (isCollapsed) {
          value[id].min = Math.max(0, newCurrent - progressThreshold);
        }

        return value;
      });
    },
    [scrollValues, id, activeScrollId, progressThreshold]
  );

  const onScroll = useAnimatedScrollHandler(scrollHandler);

  const minHeightContentContainerStyle = useAnimatedStyle(() => {
    if (globalThis.__RUNTIME_KIND === RuntimeKind.ReactNative) {
      return {};
    }

    const measurement = measure(animatedRef);

    if (!measurement) {
      return {};
    }

    return {
      minHeight: measurement.height + progressThreshold,
    };
  });

  const resolvedRefreshControl = useMemo(
    () =>
      resolveRefreshControl({
        refreshControl,
        refreshing,
        onRefresh,
        progressViewOffset: originalHeaderHeight,
      }),
    [onRefresh, originalHeaderHeight, refreshControl, refreshing]
  );

  const scrollableProps = {
    onScroll,
    scrollEventThrottle: 16,
    ref: animatedRef,
    refreshControl: resolvedRefreshControl,
  };
  const headerMotionContext = {
    originalHeaderHeight,
    minHeightContentContainerStyle,
  };

  return { scrollableProps, headerMotionContext };
}
