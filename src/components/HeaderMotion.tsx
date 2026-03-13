import { useCallback, useRef, useEffect, useMemo } from 'react';
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
  ScrollValues,
} from '../types';
import {
  DEFAULT_MEASURE_DYNAMIC,
  DEFAULT_PROGRESS_THRESHOLD,
  DEFAULT_SCROLL_ID,
  getInitialScrollValue,
} from '../utils';

export interface HeaderMotionProps<T extends string> {
  /**
   * The threshold at which the header animation completes (reaches progress = 1).
   * Can be a fixed number or a function that calculates based on the result of {@link measureDynamic}.
   *
   * Defaults to a function that returns the return value of `measureDynamic` unchanged.
   */
  progressThreshold?: ProgressThreshold;
  /**
   * Function to measure a dimension of choice of the animated element of the header.
   *
   * Receives the layout change event from React Native.
   *
   * This function can be further accessed when rendering headers from `HeaderMotion.Header` or `useMotionProgress`  - should be passed to the `onLayout` prop of such. If used, can be used for dynamic calculation of the {@link progressThreshold}.
   *
   * Defaults to measuring the height from the event.
   */
  measureDynamic?: MeasureAnimatedHeader;
  /**
   * Mode for measuring dynamic header height.
   * - 'mount': Only measure once on mount
   * - 'update': Update measurement on every layout recalculation of the component that {@link measureDynamic} was provided to as the `onLayout` property
   * @default 'mount'
   */
  measureDynamicMode?: 'update' | 'mount';
  /**
   * Shared value for tracking the active scroll ID in multi-scroll scenarios (e.g. tabs).
   * When provided, the header animation will sync across multiple scroll views.
   */
  activeScrollId?: SharedValue<T>;
  /**
   * Extrapolation type for the progress animation.
   * Controls how the progress value behaves outside the threshold range.
   *
   * You may want to modify it to achieve some animations for the overscroll scenarios.
   * @default Extrapolation.CLAMP
   */
  progressExtrapolation?: ExtrapolationType;
  /** Child components that will have access to the header motion context */
  children: ReactNode;
}

/**
 * Context provider component for HeaderMotion.
 * Manages header animation state and provides it to child components via context.
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
  const originalHeaderHeight = useSharedValue(0);
  const progressThresholdValue = useSharedValue(
    typeof progressThreshold === 'number' ? progressThreshold : Infinity
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
        progressThresholdValue.set(
          typeof progressThreshold === 'number'
            ? progressThreshold
            : progressThreshold(measured)
        );
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
    progressThresholdValue.set(
      measured === undefined ? Infinity : progressThreshold(measured)
    );
  }, [progressThreshold, dynamicMeasurement, progressThresholdValue]);

  const measureTotalHeight = useCallback<MeasureAnimatedHeaderAndSet>(
    (e) => {
      const measuredValue = e.nativeEvent.layout.height;
      if (originalHeaderHeight.get() === measuredValue) {
        return;
      }

      originalHeaderHeight.set(measuredValue);
    },
    [originalHeaderHeight]
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
    const id = activeScrollId?.get() ?? DEFAULT_SCROLL_ID;
    const scrollValue = scrollValues.get()[id];
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
      progressThreshold: progressThresholdValue,
      scrollValues,
      scrollToRef,
      activeScrollId: activeScrollId as SharedValue<string> | undefined,
    }),
    [
      originalHeaderHeight,
      progress,
      measureTotalHeight,
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
