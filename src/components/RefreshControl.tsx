import { type ReactNode, useEffect } from 'react';
import type { RefreshControlProps as RNRefreshControlProps } from 'react-native';
import Animated, {
  useEvent,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { RefreshPhase } from '../types';
import { useRefreshControl } from '../hooks';
import HeaderMotionRefreshControlNativeComponent, {
  type RefreshProgressEvent,
} from '../specs/HeaderMotionRefreshControlNativeComponent';

const AnimatedRefreshControl = Animated.createAnimatedComponent(
  HeaderMotionRefreshControlNativeComponent
);

const DEFAULT_REFRESH_PROGRESS_COMMIT_DURATION = 160;
const DEFAULT_REFRESH_PROGRESS_SETTLE_DURATION = 180;
const DEFAULT_REFRESH_CONFIRMATION_TIMEOUT = 200;

export type HeaderMotionRefreshControlProps = RNRefreshControlProps & {
  /**
   * Distance that commits the pull gesture into a refresh.
   *
   * Defaults to `80`.
   */
  triggerDistance?: number;
  /**
   * Keeps the scroll content visually pinned while the native pull gesture is
   * measured. Disable this to expose the platform overscroll gap on iOS.
   *
   * iOS only. On Android the pull gesture is intercepted before the scrollable
   * receives it, so the content never moves during a pull.
   *
   * Defaults to `true`.
   */
  keepScrollContentPinned?: boolean;
  /**
   * Duration of the visual snap from pull overshoot back to committed refresh
   * progress.
   *
   * Defaults to `160`.
   */
  progressCommitDuration?: number;
  /**
   * Duration of the visual settle animation from the current displayed refresh
   * progress back to idle.
   *
   * Defaults to `180`.
   */
  progressSettleDuration?: number;
  /**
   * How long (in milliseconds) the native control waits for `refreshing={true}`
   * to commit after `onRefresh` fires. If the confirmation does not arrive in
   * time, the control settles back to idle through the `Finishing` phase.
   *
   * Pass `0` or a negative value to disable the fallback entirely — the
   * control then stays in the `Refreshing` phase until `refreshing` is
   * toggled, matching the behavior of React Native's built-in refresh
   * controls. Note that while the fallback is disabled and no confirmation
   * arrives, new pull gestures stay blocked.
   *
   * Defaults to `200`.
   */
  refreshConfirmationTimeout?: number;
  children?: ReactNode;
};

const isPullPhase = (phase: RefreshPhase) => {
  'worklet';
  return phase === RefreshPhase.Pulling || phase === RefreshPhase.Ready;
};

const isSettlePhase = (phase: RefreshPhase) => {
  'worklet';
  return phase === RefreshPhase.Cancelling || phase === RefreshPhase.Finishing;
};

const resolveTiming = (value: number, duration: number) => {
  'worklet';
  return duration <= 0 ? value : withTiming(value, { duration });
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
  keepScrollContentPinned = true,
  progressCommitDuration = DEFAULT_REFRESH_PROGRESS_COMMIT_DURATION,
  progressSettleDuration = DEFAULT_REFRESH_PROGRESS_SETTLE_DURATION,
  refreshConfirmationTimeout = DEFAULT_REFRESH_CONFIRMATION_TIMEOUT,
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
  const displayedPhase = useSharedValue(RefreshPhase.Idle);
  const commitDuration = useSharedValue(progressCommitDuration);
  const settleDuration = useSharedValue(progressSettleDuration);

  const onRefreshProgress = useEvent<RefreshProgressEvent>(
    (event) => {
      'worklet';
      const phase = event.phase as RefreshPhase;
      const previousDisplayedPhase = displayedPhase.value;

      state.rawProgress.value = event.progress;
      state.pullDistance.value = event.pullDistance;
      state.triggerDistance.value = event.triggerDistance;
      state.phase.value = phase;
      displayedPhase.value = phase;

      if (isPullPhase(phase)) {
        state.progress.value = event.progress;
        return;
      }

      if (phase === RefreshPhase.Refreshing) {
        if (previousDisplayedPhase !== RefreshPhase.Refreshing) {
          state.progress.value = resolveTiming(1, commitDuration.value);
        }
        return;
      }

      if (isSettlePhase(phase)) {
        if (!isSettlePhase(previousDisplayedPhase)) {
          state.progress.value = resolveTiming(0, settleDuration.value);
        }
        return;
      }

      state.progress.value = 0;
    },
    ['onRefreshProgress']
  );

  useEffect(() => {
    return () => {
      // Reset the shared refresh state when the control unmounts so custom
      // refresh UI does not stay frozen mid-refresh.
      state.phase.set(RefreshPhase.Idle);
      state.rawProgress.set(0);
      state.progress.set(0);
      state.pullDistance.set(0);
    };
  }, [state]);

  useEffect(() => {
    commitDuration.set(progressCommitDuration);
    settleDuration.set(progressSettleDuration);
    state.triggerDistance.set(triggerDistance);
    if (!enabled) {
      state.phase.set(RefreshPhase.Disabled);
      displayedPhase.set(RefreshPhase.Disabled);
      state.rawProgress.set(0);
      state.progress.set(0);
      state.pullDistance.set(0);
      return;
    }

    if (refreshing) {
      const currentDisplayedPhase = displayedPhase.get();
      displayedPhase.set(RefreshPhase.Refreshing);
      state.phase.set(RefreshPhase.Refreshing);
      state.rawProgress.set(1);
      state.pullDistance.set(triggerDistance);
      if (currentDisplayedPhase !== RefreshPhase.Refreshing) {
        state.progress.set(resolveTiming(1, progressCommitDuration));
      }
    }
  }, [
    commitDuration,
    displayedPhase,
    enabled,
    progressCommitDuration,
    progressSettleDuration,
    refreshing,
    settleDuration,
    state,
    triggerDistance,
  ]);

  return (
    <AnimatedRefreshControl
      {...props}
      enabled={enabled}
      refreshing={refreshing}
      progressViewOffset={progressViewOffset}
      triggerDistance={triggerDistance}
      keepScrollContentPinned={keepScrollContentPinned}
      refreshConfirmationTimeout={Math.round(refreshConfirmationTimeout)}
      onRefresh={onRefresh}
      onRefreshProgress={onRefreshProgress as any}
    >
      {children}
    </AnimatedRefreshControl>
  );
}

/**
 * Marks the component so `resolveRefreshControl` can recognize it without
 * importing this module (which would create an import cycle). The headless
 * native control never reads `progressViewOffset`, so the resolver must not
 * swap this element for the built-in `RefreshControl` when injecting offsets.
 */
RefreshControl.isHeaderMotionRefreshControl = true;
