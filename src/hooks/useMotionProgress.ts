import { useHeaderMotionContextOrThrow } from '../context';
import type { MotionProgress } from '../types';

/**
 * Hook to access motion progress values for header animations.
 * Returns the progress value (0-1) and threshold.
 *
 * Must be used within a {@link HeaderMotion} component.
 *
 * @returns Motion progress values:
 * - `progress`: Shared value from 0 to 1
 * - `progressThreshold`: The threshold at which animation completes
 *
 * @throws Error if used outside of a {@link HeaderMotion} component
 *
 * @example
 * ```tsx
 * function MyHeader() {
 *   const { progress, progressThreshold } = useMotionProgress();
 * }
 * ```
 */
export function useMotionProgress(): MotionProgress {
  const { progress, progressThreshold } = useHeaderMotionContextOrThrow(
    'useMotionProgress must be used within <HeaderMotion /> or <HeaderMotion.NavigationBridge />. If you are rendering inside a navigation header, bridge the context with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
  );

  return {
    progress,
    progressThreshold,
  };
}
