import { useCallback, useMemo } from 'react';
import { scheduleOnUI } from 'react-native-worklets';
import { useHeaderMotionContextOrThrow } from '../context';
import type { MotionProgress } from '../types';
import { resolveScrollIdForProgress } from '../utils';

export interface CollapsibleScrollOptions {
  /**
   * Animates the scroll to the target state.
   *
   * @default true
   */
  animated?: boolean;
}

export interface UseCollapsibleHeaderResult extends MotionProgress {
  /** Scrolls the active scrollable so the header fully collapses. */
  collapse: (options?: CollapsibleScrollOptions) => void;
  /** Scrolls the active scrollable so the header fully expands. */
  expand: (options?: CollapsibleScrollOptions) => void;
}

/**
 * Motion state and imperative controls for a collapsible header.
 *
 * Works anywhere inside a `Collapsible`, `CollapsibleTabs`, or plain
 * `HeaderMotion` tree. `collapse()` and `expand()` scroll the currently
 * active scrollable to the corresponding terminal state.
 *
 * @example
 * ```tsx
 * const { progress, collapse, expand } = useCollapsibleHeader();
 * ```
 */
export function useCollapsibleHeader(): UseCollapsibleHeaderResult {
  const {
    progress,
    progressThreshold,
    scrollValues,
    activeScrollId,
    scrollToRef,
  } = useHeaderMotionContextOrThrow(
    'useCollapsibleHeader must be used within <Collapsible />, <CollapsibleTabs />, or <HeaderMotion />.'
  );

  const scrollToProgress = useCallback(
    (target: 0 | 1, options?: CollapsibleScrollOptions) => {
      const scrollToActive = scrollToRef.current;
      if (!scrollToActive) {
        return;
      }

      const animated = options?.animated ?? true;

      scheduleOnUI(() => {
        'worklet';
        const values = scrollValues.get();
        const id = resolveScrollIdForProgress(values, activeScrollId?.get());
        const scrollValue = values[id];
        if (!scrollValue) {
          return;
        }

        const y =
          target === 1
            ? scrollValue.min + progressThreshold.get()
            : scrollValue.min;
        scrollToActive(y, { isValueDelta: false, animated });
      });
    },
    [scrollToRef, scrollValues, activeScrollId, progressThreshold]
  );

  const collapse = useCallback(
    (options?: CollapsibleScrollOptions) => scrollToProgress(1, options),
    [scrollToProgress]
  );
  const expand = useCallback(
    (options?: CollapsibleScrollOptions) => scrollToProgress(0, options),
    [scrollToProgress]
  );

  return useMemo(
    () => ({ progress, progressThreshold, collapse, expand }),
    [progress, progressThreshold, collapse, expand]
  );
}
