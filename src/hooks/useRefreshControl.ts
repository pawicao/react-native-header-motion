import { useHeaderMotionContextOrThrow } from '../context';

/**
 * Returns the HeaderMotion-owned refresh-control animation state.
 *
 * Use this inside a `HeaderMotion` tree to build custom refresh UI, usually in
 * the header. The values are updated by `HeaderMotion.RefreshControl`.
 */
export function useRefreshControl() {
  return useHeaderMotionContextOrThrow(
    'useRefreshControl must be used within a HeaderMotion component'
  ).refreshControl;
}
