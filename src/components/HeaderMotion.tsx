import { useCallback, useMemo, useState } from 'react';
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
  const [dynamicMeasurement, setDynamicMeasurement] = useState<
    number | undefined
  >(undefined);
  const [originalHeaderHeight, setOriginalHeaderHeight] = useState(0);

  const setOrUpdateDynamicMeasurement =
    useCallback<MeasureAnimatedHeaderAndSet>(
      (e) => {
        const measured = measureDynamic(e);
        setDynamicMeasurement((prevMeasurement) => {
          if (prevMeasurement !== undefined && measureDynamicMode === 'mount') {
            return prevMeasurement;
          }

          return measured;
        });
      },
      [measureDynamicMode, measureDynamic, setDynamicMeasurement]
    );

  const calculatedProgressThreshold = useMemo(() => {
    if (typeof progressThreshold === 'number') {
      return progressThreshold;
    }

    if (dynamicMeasurement === undefined) {
      return Infinity;
    }
    return progressThreshold(dynamicMeasurement);
  }, [dynamicMeasurement, progressThreshold]);

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
    const id = activeScrollId?.get() ?? DEFAULT_SCROLL_ID;
    const scrollValue = scrollValues.get()[id];

    if (!scrollValue) {
      return 0;
    }

    const { min, current } = scrollValue;
    return interpolate(
      current,
      [min, min + calculatedProgressThreshold],
      [0, 1],
      progressExtrapolation
    );
  });

  const ctxValue = useMemo(
    () => ({
      progress,
      originalHeaderHeight,
      measureDynamic: setOrUpdateDynamicMeasurement,
      measureTotalHeight,
      progressThreshold: calculatedProgressThreshold,
      scrollValues,
      activeScrollId: activeScrollId as SharedValue<string> | undefined,
    }),
    [
      originalHeaderHeight,
      progress,
      measureTotalHeight,
      setOrUpdateDynamicMeasurement,
      scrollValues,
      activeScrollId,
      calculatedProgressThreshold,
    ]
  );

  return (
    <HeaderMotionContext.Provider value={ctxValue}>
      {children}
    </HeaderMotionContext.Provider>
  );
}

export { HeaderMotionContextProvider };
