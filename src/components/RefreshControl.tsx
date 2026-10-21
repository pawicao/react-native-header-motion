import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import type { RefreshControlProps as RNRefreshControlProps } from 'react-native';
import Animated, {
  useEvent,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { REFRESH_PHASE_BY_NATIVE_CODE, RefreshPhase } from '../types';
import { useHeaderMotionContextOrThrow } from '../context';
import HeaderMotionRefreshControlNativeComponent, {
  type NativeProps,
  type RefreshProgressEvent,
} from '../specs/HeaderMotionRefreshControlNativeComponent';

const AnimatedRefreshControl = Animated.createAnimatedComponent(
  HeaderMotionRefreshControlNativeComponent
);

const DEFAULT_REFRESH_PROGRESS_COMMIT_DURATION = 160;
const DEFAULT_REFRESH_PROGRESS_SETTLE_DURATION = 180;
const DEFAULT_REFRESH_CONFIRMATION_TIMEOUT = 200;

/**
 * React Native `RefreshControl` props that configure the built-in indicator's
 * appearance. The headless control renders no UI, so accepting them would be
 * dead configuration — they are deliberately excluded from the public API.
 * `progressViewOffset` is excluded for the same reason: the indicator it
 * offsets does not exist here.
 */
type ExcludedVisualRefreshControlProps =
  | 'colors'
  | 'progressBackgroundColor'
  | 'progressViewOffset'
  | 'size'
  | 'tintColor'
  | 'title'
  | 'titleColor';

/**
 * Props for the headless `HeaderMotion.RefreshControl`.
 *
 * The control follows React Native's `RefreshControl` behavior contract
 * (`refreshing`, `onRefresh`, `enabled`), but it renders no UI of its own, so
 * the built-in visual props are not part of this API. Build the refresh
 * visuals from `useRefreshControl()` instead.
 */
export type HeaderMotionRefreshControlProps = Omit<
  RNRefreshControlProps,
  ExcludedVisualRefreshControlProps
> & {
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
   * The same duration drives the native settle timeline, so the `Cancelling` /
   * `Finishing` phases last exactly as long as the progress animation and the
   * `Idle` phase arrives when the animation completes.
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

// Phases that represent real activity — the ones that may take ownership of
// the shared refresh state away from another control.
const isClaimingPhase = (phase: RefreshPhase) => {
  'worklet';
  return (
    phase === RefreshPhase.Pulling ||
    phase === RefreshPhase.Ready ||
    phase === RefreshPhase.Refreshing
  );
};

const resolveTiming = (value: number, duration: number) => {
  'worklet';
  return duration <= 0 ? value : withTiming(value, { duration });
};

// Identifies each mounted control so the shared refresh state has a single
// owner at a time. Module-scoped so ids stay unique across HeaderMotion trees.
let nextRefreshControlId = 1;

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
  triggerDistance = 80,
  keepScrollContentPinned = true,
  progressCommitDuration = DEFAULT_REFRESH_PROGRESS_COMMIT_DURATION,
  progressSettleDuration = DEFAULT_REFRESH_PROGRESS_SETTLE_DURATION,
  refreshConfirmationTimeout = DEFAULT_REFRESH_CONFIRMATION_TIMEOUT,
  children,
  ...props
}: HeaderMotionRefreshControlProps) {
  const { refreshControl: state, refreshControlOwner } =
    useHeaderMotionContextOrThrow(
      'HeaderMotion.RefreshControl must be used within a HeaderMotion component'
    );
  const controlId = useMemo(() => nextRefreshControlId++, []);
  const displayedPhase = useSharedValue<RefreshPhase>(RefreshPhase.Idle);
  const commitDuration = useSharedValue(progressCommitDuration);
  const settleDuration = useSharedValue(progressSettleDuration);
  // Mirrors the native clamp so JS and native agree on the effective distance.
  const resolvedTriggerDistance = Math.max(1, triggerDistance);
  // Latest `refreshing` prop, readable from the unmount cleanup.
  const refreshingRef = useRef(refreshing);
  refreshingRef.current = refreshing;

  const onRefreshProgress = useEvent<RefreshProgressEvent>(
    (event) => {
      'worklet';
      const phase =
        REFRESH_PHASE_BY_NATIVE_CODE[event.phase] ?? RefreshPhase.Idle;

      const owner = refreshControlOwner.get();
      if (owner !== controlId) {
        // Only real pull/refresh activity may take the shared state over,
        // while an unowned state also accepts a settle stream picking up an
        // orphaned refresh and the Idle that clears a Disabled state on
        // re-enable. Any other passive phase from a non-owner must not
        // disturb the owner's presentation.
        const canClaim =
          isClaimingPhase(phase) ||
          (owner === null &&
            (isSettlePhase(phase) ||
              (phase === RefreshPhase.Idle &&
                state.phase.get() === RefreshPhase.Disabled)));
        if (!canClaim) {
          return;
        }
        refreshControlOwner.set(controlId);
      }

      const previousDisplayedPhase = displayedPhase.get();

      state.rawProgress.set(event.progress);
      state.pullDistance.set(event.pullDistance);
      state.triggerDistance.set(event.triggerDistance);
      state.phase.set(phase);
      displayedPhase.set(phase);

      if (isPullPhase(phase)) {
        state.progress.set(event.progress);
        return;
      }

      if (phase === RefreshPhase.Refreshing) {
        if (previousDisplayedPhase !== RefreshPhase.Refreshing) {
          state.progress.set(resolveTiming(1, commitDuration.get()));
        }
        return;
      }

      if (isSettlePhase(phase)) {
        if (!isSettlePhase(previousDisplayedPhase)) {
          state.progress.set(resolveTiming(0, settleDuration.get()));
        }
        return;
      }

      // Idle / Disabled are terminal — release the shared state.
      refreshControlOwner.set(null);
      if (
        phase === RefreshPhase.Idle &&
        isSettlePhase(previousDisplayedPhase)
      ) {
        // The settle animation is already heading to 0; hard-setting it here
        // would cut its final frames whenever the native settle clock runs a
        // frame ahead of the Reanimated one.
        return;
      }
      state.progress.set(0);
    },
    ['onRefreshProgress']
  );

  useEffect(() => {
    return () => {
      const owner = refreshControlOwner.get();
      if (owner !== null && owner !== controlId) {
        // Another control owns the shared state; a bystander unmounting must
        // not reset the header's refresh UI.
        return;
      }

      const phase = state.phase.get();

      if (phase === RefreshPhase.Refreshing && refreshingRef.current) {
        // A controlled refresh is still in progress — other controls sharing
        // the same `refreshing` prop keep driving it. Hand the state over
        // instead of resetting the header mid-refresh.
        refreshControlOwner.set(null);
        return;
      }

      state.rawProgress.set(0);
      state.pullDistance.set(0);

      if (phase === RefreshPhase.Idle || phase === RefreshPhase.Disabled) {
        refreshControlOwner.set(null);
        state.phase.set(RefreshPhase.Idle);
        state.progress.set(0);
        return;
      }

      // The control disappears mid-gesture or mid-refresh: settle the
      // presentation instead of snapping it, then release ownership.
      const settlePhase =
        phase === RefreshPhase.Refreshing || phase === RefreshPhase.Finishing
          ? RefreshPhase.Finishing
          : RefreshPhase.Cancelling;
      const duration = settleDuration.get();
      if (duration <= 0) {
        refreshControlOwner.set(null);
        state.phase.set(RefreshPhase.Idle);
        state.progress.set(0);
        return;
      }

      state.phase.set(settlePhase);
      state.progress.set(
        withTiming(0, { duration }, (finished) => {
          'worklet';
          if (finished) {
            state.phase.set(RefreshPhase.Idle);
            refreshControlOwner.set(null);
          }
        })
      );
    };
  }, [controlId, refreshControlOwner, settleDuration, state]);

  useEffect(() => {
    commitDuration.set(progressCommitDuration);
    settleDuration.set(progressSettleDuration);
  }, [
    commitDuration,
    settleDuration,
    progressCommitDuration,
    progressSettleDuration,
  ]);

  useEffect(() => {
    state.triggerDistance.set(resolvedTriggerDistance);
  }, [state, resolvedTriggerDistance]);

  useEffect(() => {
    if (!enabled) {
      displayedPhase.set(RefreshPhase.Disabled);
      const owner = refreshControlOwner.get();
      if (owner !== null && owner !== controlId) {
        // Another control is actively driving the shared state; a bystander
        // being disabled must not tear that presentation down.
        return;
      }
      refreshControlOwner.set(null);
      state.phase.set(RefreshPhase.Disabled);
      state.rawProgress.set(0);
      state.progress.set(0);
      state.pullDistance.set(0);
      return;
    }

    {
      // Re-enabling must bring a Disabled state back to Idle from JS: the
      // worklet releases ownership at Disabled, so native's own re-enable
      // Idle emission is not guaranteed to arrive before the user looks.
      const owner = refreshControlOwner.get();
      if (
        (owner === null || owner === controlId) &&
        state.phase.get() === RefreshPhase.Disabled
      ) {
        refreshControlOwner.set(null);
        state.phase.set(RefreshPhase.Idle);
        state.rawProgress.set(0);
        state.progress.set(0);
        state.pullDistance.set(0);
      }
    }

    if (!refreshing) {
      // The transition out of a controlled refresh is normally owned by
      // native (Finishing followed by a settle to Idle). But an orphaned
      // controlled refresh — its owner unmounted mid-refresh and `refreshing`
      // ended while no control was mounted — has no native driver left, so a
      // control mounting into that state must settle it itself.
      if (
        refreshControlOwner.get() === null &&
        state.phase.get() === RefreshPhase.Refreshing
      ) {
        refreshControlOwner.set(controlId);
        state.rawProgress.set(0);
        state.pullDistance.set(0);
        const duration = settleDuration.get();
        if (duration <= 0) {
          refreshControlOwner.set(null);
          state.phase.set(RefreshPhase.Idle);
          state.progress.set(0);
          return;
        }
        state.phase.set(RefreshPhase.Finishing);
        state.progress.set(
          withTiming(0, { duration }, (finished) => {
            'worklet';
            if (finished) {
              state.phase.set(RefreshPhase.Idle);
              refreshControlOwner.set(null);
            }
          })
        );
      }
      return;
    }

    // A controlled refresh is real activity — claim the shared state.
    refreshControlOwner.set(controlId);
    const currentDisplayedPhase = displayedPhase.get();
    displayedPhase.set(RefreshPhase.Refreshing);
    state.phase.set(RefreshPhase.Refreshing);
    state.rawProgress.set(1);
    // Derived from the prop instead of read back from `state.triggerDistance`:
    // shared-value writes from the React runtime are queued onto the UI
    // runtime while reads run against it synchronously, so the write in the
    // effect above is not guaranteed to be visible here.
    state.pullDistance.set(resolvedTriggerDistance);
    if (currentDisplayedPhase !== RefreshPhase.Refreshing) {
      state.progress.set(resolveTiming(1, progressCommitDuration));
    }
  }, [
    controlId,
    displayedPhase,
    enabled,
    progressCommitDuration,
    refreshControlOwner,
    refreshing,
    resolvedTriggerDistance,
    settleDuration,
    state,
  ]);

  return (
    <AnimatedRefreshControl
      {...props}
      enabled={enabled}
      refreshing={refreshing}
      triggerDistance={resolvedTriggerDistance}
      keepScrollContentPinned={keepScrollContentPinned}
      refreshConfirmationTimeout={Math.round(refreshConfirmationTimeout)}
      progressSettleDuration={Math.max(0, Math.round(progressSettleDuration))}
      onRefresh={onRefresh}
      // `useEvent` returns a Reanimated worklet handler, which the animated
      // component unwraps at the native boundary. Its call signature cannot
      // line up with the codegen `DirectEventHandler`, so the cast is the
      // narrowest way to keep the prop name/shape checked against the spec.
      onRefreshProgress={
        onRefreshProgress as unknown as NativeProps['onRefreshProgress']
      }
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
