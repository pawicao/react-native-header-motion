import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  type ExtrapolationType,
  type SharedValue,
} from 'react-native-reanimated';
import { HeaderMotionContext } from '../context';
import type { ReactNode } from 'react';
import type {
  ScrollTo,
  MeasureAnimatedHeader,
  MeasureAnimatedHeaderAndSet,
  ProgressThreshold,
  RefreshControlState,
  ScrollValues,
} from '../types';
import { RefreshPhase } from '../types';
import {
  DEFAULT_MEASURE_DYNAMIC,
  DEFAULT_PROGRESS_THRESHOLD,
  DEFAULT_SCROLL_ID,
  getInitialScrollValue,
} from '../utils';

const resolveScrollIdForProgress = (
  scrollValues: ScrollValues,
  activeScrollIdValue: string | undefined
) => {
  'worklet';

  if (activeScrollIdValue) {
    return activeScrollIdValue;
  }

  let onlyNonDefaultId: string | null = null;
  for (const key in scrollValues) {
    if (key === DEFAULT_SCROLL_ID) {
      continue;
    }

    if (onlyNonDefaultId !== null) {
      return DEFAULT_SCROLL_ID;
    }

    onlyNonDefaultId = key;
  }

  return onlyNonDefaultId ?? DEFAULT_SCROLL_ID;
};

export interface HeaderMotionProps<T extends string> {
  /**
   * Distance that maps the active scrollable from `progress = 0`
   * to `progress = 1`.
   *
   * Use a number when the collapse distance is fixed. Use a function when the
   * distance should depend on what `measureDynamic` reads from
   * `HeaderMotion.Header.Dynamic`.
   *
   * A common pattern is to measure the height of the part of the header that
   * should disappear and use that as the threshold.
   */
  progressThreshold?: ProgressThreshold;
  /**
   * Reads the value that should define the "collapsible" part of the header.
   *
   * This is called from `HeaderMotion.Header.Dynamic` on layout. The returned
   * number feeds `progressThreshold` when you provide that prop as a function.
   *
   * By default, the library measures the dynamic section's height. Override
   * this when the collapse distance should be based on something else, for
   * example width or a derived value from the layout event.
   */
  measureDynamic?: MeasureAnimatedHeader;
  /**
   * Controls when `measureDynamic` is allowed to update.
   *
   * - 'mount': Only measure once on mount
   * - 'update': Re-measure whenever `HeaderMotion.Header.Dynamic` lays out again
   *
   * Use `'mount'` for stable headers. Use `'update'` when the dynamic section
   * can change size after mount, for example after async data loads or content
   * expansion.
   *
   * @default 'mount'
   */
  measureDynamicMode?: 'update' | 'mount';
  /**
   * Shared value that tells HeaderMotion which scrollable currently owns the
   * header progress in multi-scroll setups.
   *
   * Pass this when one header is shared across multiple scrollables, such as
   * tabs or pager pages. Each scrollable should also get its own `scrollId`.
   */
  activeScrollId?: SharedValue<T>;
  /**
   * Controls how `progress` behaves outside the `[0, threshold]` range.
   *
   * The default clamps the value between `0` and `1`. Relax this if you want
   * to animate overscroll or other out-of-range states.
   *
   * @default Extrapolation.CLAMP
   */
  progressExtrapolation?: ExtrapolationType;
  /** Descendants that should participate in the shared header-motion state. */
  children: ReactNode;
}

/**
 * Root provider for a header-motion setup.
 *
 * It tracks the measured header layout, the active scroll position, and the
 * derived `progress` shared value consumed by your animated header UI.
 *
 * @template T - The type of scroll ID string
 */
function HeaderMotionContextProvider<T extends string>({
  progressThreshold = DEFAULT_PROGRESS_THRESHOLD,
  measureDynamic = DEFAULT_MEASURE_DYNAMIC,
  measureDynamicMode = 'mount',
  activeScrollId,
  progressExtrapolation = Extrapolation.CLAMP,
  children,
}: HeaderMotionProps<T>) {
  const dynamicMeasurement = useSharedValue<number | undefined>(undefined);
  const [originalHeaderHeight, setOriginalHeaderHeight] = useState(0);
  const progressThresholdValue = useSharedValue(
    typeof progressThreshold === 'number' ? progressThreshold : Infinity
  );
  const headerPanMomentumOffset = useSharedValue<number | null>(null);
  const refreshControlOwner = useSharedValue<number | null>(null);
  const refreshControlPhase = useSharedValue<RefreshPhase>(RefreshPhase.Idle);
  const refreshControlProgress = useSharedValue(0);
  const refreshControlRawProgress = useSharedValue(0);
  const refreshControlPullDistance = useSharedValue(0);
  const refreshControlTriggerDistance = useSharedValue(0);
  const refreshControlOvershoot = useDerivedValue(() =>
    Math.max(0, refreshControlProgress.get() - 1)
  );
  const refreshControlIsPulling = useDerivedValue(
    () => refreshControlPhase.get() === RefreshPhase.Pulling
  );
  const refreshControlIsReady = useDerivedValue(
    () => refreshControlPhase.get() === RefreshPhase.Ready
  );
  const refreshControlIsRefreshing = useDerivedValue(
    () => refreshControlPhase.get() === RefreshPhase.Refreshing
  );
  const refreshControlIsSettling = useDerivedValue(
    () =>
      refreshControlPhase.get() === RefreshPhase.Cancelling ||
      refreshControlPhase.get() === RefreshPhase.Finishing
  );
  const refreshControlIsActive = useDerivedValue(
    () =>
      refreshControlPhase.get() !== RefreshPhase.Idle &&
      refreshControlPhase.get() !== RefreshPhase.Disabled
  );

  const setOrUpdateDynamicMeasurement =
    useCallback<MeasureAnimatedHeaderAndSet>(
      (e) => {
        const prevMeasurement = dynamicMeasurement.get();
        if (prevMeasurement !== undefined && measureDynamicMode === 'mount') {
          return;
        }

        const measured = measureDynamic(e);
        if (prevMeasurement === measured) {
          return;
        }

        dynamicMeasurement.set(measured);
        const nextThreshold =
          typeof progressThreshold === 'number'
            ? progressThreshold
            : progressThreshold(measured);
        progressThresholdValue.set(nextThreshold);
      },
      [
        measureDynamicMode,
        measureDynamic,
        dynamicMeasurement,
        progressThreshold,
        progressThresholdValue,
      ]
    );

  useEffect(() => {
    if (typeof progressThreshold === 'number') {
      progressThresholdValue.set(progressThreshold);
      return;
    }

    const measured = dynamicMeasurement.get();
    const nextThreshold =
      measured === undefined ? Infinity : progressThreshold(measured);
    progressThresholdValue.set(nextThreshold);
  }, [progressThreshold, dynamicMeasurement, progressThresholdValue]);

  const measureTotalHeight = useCallback<MeasureAnimatedHeaderAndSet>(
    (e) => {
      const measuredValue = e.nativeEvent.layout.height;
      setOriginalHeaderHeight(measuredValue);
    },
    [setOriginalHeaderHeight]
  );

  const scrollValues = useSharedValue<ScrollValues>({
    [DEFAULT_SCROLL_ID]: getInitialScrollValue(),
  });

  useAnimatedReaction(
    () => activeScrollId?.get(),
    (id) => {
      if (!id || scrollValues.get()[id]) {
        return;
      }

      scrollValues.modify((value) => {
        (value as ScrollValues)[id] = getInitialScrollValue();
        return value;
      });
    }
  );

  const progress = useDerivedValue(() => {
    const values = scrollValues.get();
    const id = resolveScrollIdForProgress(values, activeScrollId?.get());
    const scrollValue = values[id];
    const threshold = progressThresholdValue.get();

    if (!scrollValue) {
      return 0;
    }

    const { min, current } = scrollValue;
    return interpolate(
      current,
      [min, min + threshold],
      [0, 1],
      progressExtrapolation
    );
  });

  const scrollToRef = useRef<ScrollTo>(null);
  const refreshControl = useMemo<RefreshControlState>(
    () => ({
      progress: refreshControlProgress,
      rawProgress: refreshControlRawProgress,
      pullDistance: refreshControlPullDistance,
      triggerDistance: refreshControlTriggerDistance,
      phase: refreshControlPhase,
      overshoot: refreshControlOvershoot,
      isPulling: refreshControlIsPulling,
      isReady: refreshControlIsReady,
      isRefreshing: refreshControlIsRefreshing,
      isSettling: refreshControlIsSettling,
      isActive: refreshControlIsActive,
    }),
    [
      refreshControlIsActive,
      refreshControlIsPulling,
      refreshControlIsReady,
      refreshControlIsRefreshing,
      refreshControlIsSettling,
      refreshControlOvershoot,
      refreshControlPhase,
      refreshControlProgress,
      refreshControlRawProgress,
      refreshControlPullDistance,
      refreshControlTriggerDistance,
    ]
  );
  // FUTURE: SharedValue-based scrollTo was removed for now because function updates
  // were not propagating reliably, while it works for refs. Revisit later.
  // We need to be updating the scrollTo on active scroll ID changes and doing it via state would cause re-renders.
  // It's a bit of an anti-pattern to use refs for this as well, but I am yet to figure out a better way to pass those if SV won't work.
  const ctxValue = useMemo(
    () => ({
      progress,
      originalHeaderHeight,
      measureDynamic: setOrUpdateDynamicMeasurement,
      measureTotalHeight,
      headerPanMomentumOffset,
      refreshControl,
      refreshControlOwner,
      progressThreshold: progressThresholdValue,
      scrollValues,
      scrollToRef,
      activeScrollId: activeScrollId as SharedValue<string> | undefined,
    }),
    [
      originalHeaderHeight,
      progress,
      measureTotalHeight,
      headerPanMomentumOffset,
      refreshControl,
      refreshControlOwner,
      setOrUpdateDynamicMeasurement,
      scrollValues,
      activeScrollId,
      progressThresholdValue,
    ]
  );

  return (
    <HeaderMotionContext.Provider value={ctxValue}>
      {children}
    </HeaderMotionContext.Provider>
  );
}

export { HeaderMotionContextProvider };
