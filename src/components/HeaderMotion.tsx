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
  progressThreshold?: ProgressThreshold;
  measureDynamic?: MeasureAnimatedHeader;
  measureDynamicMode?: 'update' | 'mount';
  activeScrollId?: SharedValue<T>;
  progressExtrapolation?: ExtrapolationType;
  children: React.ReactNode;
}

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

  const measureTotal = useCallback<MeasureAnimatedHeaderAndSet>(
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
      measureTotal,
      progressThreshold: calculatedProgressThreshold,
      scrollValues,
      activeScrollId: activeScrollId as SharedValue<string> | undefined,
    }),
    [
      originalHeaderHeight,
      progress,
      measureTotal,
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
