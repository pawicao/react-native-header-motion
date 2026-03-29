import { createContext, useContext } from 'react';
import type { HeaderMotionBridgeValue } from './types';

export const HeaderMotionContext =
  createContext<HeaderMotionBridgeValue | null>(null);

export function useHeaderMotionContextOrThrow(errorMessage: string) {
  const ctxValue = useContext(HeaderMotionContext);
  if (!ctxValue) {
    throw new Error(errorMessage);
  }

  return ctxValue;
}
