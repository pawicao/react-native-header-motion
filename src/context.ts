import { createContext, useContext } from 'react';
import type { HeaderMotionBridgeValue } from './types';

export const HeaderMotionContext =
  createContext<HeaderMotionBridgeValue | null>(null);

/**
 * Provides a default `scrollId` to every header-motion scrollable in its
 * subtree.
 *
 * An explicit `scrollId` prop always wins over this context. Container
 * components that own a scroll region (for example `CollapsibleTabs.Tab`)
 * provide it so pre-wired and custom scrollables participate in multi-scroll
 * setups without manual `scrollId` wiring.
 */
export const HeaderMotionScrollIdContext = createContext<string | undefined>(
  undefined
);

export function useHeaderMotionContextOrThrow(errorMessage: string) {
  const ctxValue = useContext(HeaderMotionContext);
  if (!ctxValue) {
    throw new Error(errorMessage);
  }

  return ctxValue;
}
