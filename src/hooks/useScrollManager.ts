import { useContext, useCallback, useEffect } from 'react';
import {
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  type ScrollHandler,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';
import { HeaderMotionContext } from '../context';
import type { ScrollManagerConfig, ScrollValues } from '../types';
import { DEFAULT_SCROLL_ID, getInitialScrollValue } from '../utils';

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

  const animatedRef = useAnimatedRef<any>();

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

  const scrollableProps = {
    onScroll,
    scrollEventThrottle: 16,
    ref: animatedRef,
  };
  const headerContext = {
    originalHeaderHeight,
  };

  return { scrollableProps, headerContext };
}
