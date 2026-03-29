import { useHeaderMotionContextOrThrow } from '../context';
import type { HeaderMotionBridgeValue } from '../types';

/**
 * Returns the full internal HeaderMotion context value.
 *
 * Most app code should use `useMotionProgress()` instead. Reach for this hook
 * only when you need to carry HeaderMotion context across a tree boundary and
 * re-provide it somewhere else.
 */
export function useHeaderMotionBridge(): HeaderMotionBridgeValue {
  return useHeaderMotionContextOrThrow(
    'useHeaderMotionBridge must be used within <HeaderMotion />. Use it only when bridging context into a separate subtree with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
  );
}
