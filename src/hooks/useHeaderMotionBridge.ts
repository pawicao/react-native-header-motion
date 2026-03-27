import { useHeaderMotionContextOrThrow } from '../context';
import type { HeaderMotionBridgeValue } from '../types';

/**
 * Hook to access the full HeaderMotion bridge value.
 * Use this only when you need to bridge header motion context into another
 * part of the tree, such as a navigation-rendered header.
 */
export function useHeaderMotionBridge(): HeaderMotionBridgeValue {
  return useHeaderMotionContextOrThrow(
    'useHeaderMotionBridge must be used within <HeaderMotion />. Use it only when bridging context into a separate subtree with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
  );
}
