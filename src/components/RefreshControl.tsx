import { type ReactNode, useEffect } from 'react';
import type { RefreshControlProps as RNRefreshControlProps } from 'react-native';
import Animated, { useEvent } from 'react-native-reanimated';
import { RefreshPhase } from '../types';
import { useRefreshControl } from '../hooks';
import HeaderMotionRefreshControlNativeComponent, {
  type RefreshProgressEvent,
} from '../specs/HeaderMotionRefreshControlNativeComponent';

const AnimatedRefreshControl = Animated.createAnimatedComponent(
  HeaderMotionRefreshControlNativeComponent
);

export type HeaderMotionRefreshControlProps = RNRefreshControlProps & {
  /**
   * Distance that commits the pull gesture into a refresh.
   *
   * Defaults to `80`.
   */
  triggerDistance?: number;
  children?: ReactNode;
};

/**
 * Headless refresh control for HeaderMotion scrollables.
 *
 * Pass it through a scrollable's `refreshControl` prop just like React Native's
 * built-in `RefreshControl`, then read animation values with
 * `useRefreshControl()`.
 */
export function RefreshControl({
  refreshing,
  onRefresh,
  enabled = true,
  progressViewOffset = 0,
  triggerDistance = 80,
  children,
  colors: _colors,
  progressBackgroundColor: _progressBackgroundColor,
  size: _size,
  tintColor: _tintColor,
  title: _title,
  titleColor: _titleColor,
  ...props
}: HeaderMotionRefreshControlProps) {
  const state = useRefreshControl();

  const onRefreshProgress = useEvent<RefreshProgressEvent>(
    (event) => {
      'worklet';
      state.progress.value = event.progress;
      state.pullDistance.value = event.pullDistance;
      state.triggerDistance.value = event.triggerDistance;
      state.phase.value = event.phase as RefreshPhase;
    },
    ['onRefreshProgress']
  );

  useEffect(() => {
    state.triggerDistance.set(triggerDistance);
    state.phase.set(
      enabled
        ? refreshing
          ? RefreshPhase.Refreshing
          : RefreshPhase.Idle
        : RefreshPhase.Disabled
    );
    if (!refreshing) {
      state.progress.set(0);
      state.pullDistance.set(0);
    }
  }, [enabled, refreshing, state, triggerDistance]);

  return (
    <AnimatedRefreshControl
      {...props}
      enabled={enabled}
      refreshing={refreshing}
      progressViewOffset={progressViewOffset}
      triggerDistance={triggerDistance}
      onRefresh={onRefresh}
      onRefreshProgress={onRefreshProgress as any}
    >
      {children}
    </AnimatedRefreshControl>
  );
}
