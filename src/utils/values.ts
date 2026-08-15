import type { SharedValue } from 'react-native-reanimated';
import type { ScrollValue, ScrollValues } from '../types';
import { DEFAULT_SCROLL_ID } from './defaults';

export function getInitialScrollValue(): ScrollValue {
  'worklet';
  return { min: 0, current: 0 };
}

export function ensureScrollValueRegistered(
  scrollValues: SharedValue<ScrollValues>,
  id: string
): ScrollValues {
  'worklet';

  const values = scrollValues.get();
  if (values[id]) {
    return values;
  }

  scrollValues.modify((value) => {
    if (!value[id]) {
      (value as ScrollValues)[id] = getInitialScrollValue();
    }

    return value;
  });

  return scrollValues.get();
}

/**
 * Resolves which scrollable currently drives the shared `progress` value:
 * the active scroll id when one is set, otherwise the only registered
 * non-default id, falling back to the default id.
 */
export function resolveScrollIdForProgress(
  scrollValues: ScrollValues,
  activeScrollIdValue: string | undefined
): string {
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
}

export function warnIfMissingActiveScrollId(
  scrollValues: ScrollValues,
  id: string,
  activeScrollId: string | undefined
): void {
  'worklet';

  if (!__DEV__ || activeScrollId || id === DEFAULT_SCROLL_ID) {
    return;
  }

  let nonDefaultCount = 0;
  let nonDefaultIds = '';

  for (const key in scrollValues) {
    if (key === DEFAULT_SCROLL_ID) {
      continue;
    }

    nonDefaultCount += 1;
    nonDefaultIds = nonDefaultIds ? `${nonDefaultIds}, ${key}` : key;
  }

  if (nonDefaultCount < 1) {
    return;
  }

  console.warn(
    `[react-native-header-motion] Explicit scrollIds (${nonDefaultIds}) are registered but no activeScrollId was provided. Pass useActiveScrollId(...).sv to <HeaderMotion activeScrollId={...}> to keep header motion deterministic.`
  );
}
