import { RefreshPhase } from '../../types';
import {
  RefreshControl,
  type HeaderMotionRefreshControlProps,
} from '../RefreshControl';

type FakeSharedValue<T> = {
  value: T;
  get: () => T;
  set: (next: T) => void;
};

type TimingMarker = {
  kind: 'timing';
  toValue: number;
  duration: number | undefined;
  callback?: (finished?: boolean) => void;
};

type EffectEntry = {
  effect: () => void | (() => void);
  deps?: unknown[];
};

type CommittedEffect = {
  deps?: unknown[];
  cleanup?: (() => void) | void;
};

// Function declaration so the hoisted jest.mock factories can call it.
//
// Models Reanimated 4's cross-runtime semantics, which the component depends
// on: `value` is the UI-runtime slot. `get()` reads it synchronously from
// either runtime (`runOnUISync` on the React side). `set()` applies
// immediately when called on the UI runtime (a worklet, e.g. the `useEvent`
// handler), but from the React runtime it is queued onto the UI runtime
// (`scheduleOnUI`) and is therefore NOT observable by a later `get()` in the
// same tick.
function mockMakeShared<T>(initial: T): FakeSharedValue<T> {
  const shared: FakeSharedValue<T> = {
    value: initial,
    get: () => shared.value,
    set: (next: T) => {
      if (mockHarness.onUiRuntime) {
        shared.value = next;
        return;
      }

      mockHarness.scheduledWrites.push(() => {
        shared.value = next;
      });
    },
  };
  return shared;
}

// `mock`-prefixed and accessed lazily so the hoisted factories may reference it.
const mockHarness: {
  slots: unknown[];
  slotIndex: number;
  pendingEffects: EffectEntry[];
  committedEffects: CommittedEffect[];
  scheduledWrites: (() => void)[];
  onUiRuntime: boolean;
  eventHandler: ((event: unknown) => void) | undefined;
  state: Record<string, FakeSharedValue<unknown>>;
  owner: FakeSharedValue<number | null>;
} = {
  slots: [],
  slotIndex: 0,
  pendingEffects: [],
  committedEffects: [],
  scheduledWrites: [],
  onUiRuntime: false,
  eventHandler: undefined,
  state: {},
  owner: undefined as unknown as FakeSharedValue<number | null>,
};

jest.mock('react', () => {
  const actual = jest.requireActual('react');

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void), deps?: unknown[]) => {
      mockHarness.pendingEffects.push({ effect, deps });
    },
    // Slot-based so values persist across the harness's direct re-invocations,
    // like real hook state does across re-renders.
    useMemo: (factory: () => unknown) => {
      const index = mockHarness.slotIndex++;
      if (!(index in mockHarness.slots)) {
        mockHarness.slots[index] = factory();
      }
      return mockHarness.slots[index];
    },
    useRef: (initial: unknown) => {
      const index = mockHarness.slotIndex++;
      if (!(index in mockHarness.slots)) {
        mockHarness.slots[index] = { current: initial };
      }
      return mockHarness.slots[index];
    },
  };
});

// jest-setup.js already registers the official Reanimated mock and requires it
// while setting up, so a file-level jest.mock() here would never reach the
// cached instance. Patch the cached module's exports instead — the component
// resolves them at call time, so renders inside the tests see these versions.
const Reanimated = require('react-native-reanimated');

Reanimated.useSharedValue = (initial: unknown) => {
  const index = mockHarness.slotIndex++;
  if (!(index in mockHarness.slots)) {
    mockHarness.slots[index] = mockMakeShared(initial);
  }
  return mockHarness.slots[index];
};
Reanimated.useEvent = (handler: (event: unknown) => void) => {
  mockHarness.eventHandler = handler;
  return handler;
};
Reanimated.withTiming = (
  toValue: number,
  config?: { duration?: number },
  callback?: (finished?: boolean) => void
): TimingMarker => ({
  kind: 'timing',
  toValue,
  duration: config?.duration,
  callback,
});

jest.mock('../../context', () => ({
  __esModule: true,
  useHeaderMotionContextOrThrow: () => ({
    refreshControl: mockHarness.state,
    refreshControlOwner: mockHarness.owner,
  }),
}));

jest.mock('../../specs/HeaderMotionRefreshControlNativeComponent', () => ({
  __esModule: true,
  default: 'HeaderMotionRefreshControl',
}));

const timing = (toValue: number, duration: number): TimingMarker => ({
  kind: 'timing',
  toValue,
  duration,
});

function flushEffects() {
  mockHarness.pendingEffects.forEach((entry, index) => {
    const previous = mockHarness.committedEffects[index];
    const depsChanged =
      !previous ||
      !entry.deps ||
      !previous.deps ||
      entry.deps.length !== previous.deps.length ||
      entry.deps.some(
        (dep, depIndex) => !Object.is(dep, previous.deps![depIndex])
      );

    if (!depsChanged) {
      return;
    }

    if (previous && typeof previous.cleanup === 'function') {
      previous.cleanup();
    }

    mockHarness.committedEffects[index] = {
      deps: entry.deps,
      cleanup: entry.effect(),
    };
  });
}

// Drains the writes the effects scheduled onto the UI runtime.
function flushScheduledWrites() {
  const writes = mockHarness.scheduledWrites;
  mockHarness.scheduledWrites = [];
  writes.forEach((write) => write());
}

function render(props: Partial<HeaderMotionRefreshControlProps> = {}) {
  mockHarness.slotIndex = 0;
  mockHarness.pendingEffects = [];
  const element = RefreshControl({
    refreshing: false,
    onRefresh: jest.fn(),
    ...props,
  } as HeaderMotionRefreshControlProps);
  flushEffects();
  flushScheduledWrites();
  return element;
}

function unmount() {
  mockHarness.committedEffects.forEach((entry) => {
    if (typeof entry.cleanup === 'function') {
      entry.cleanup();
    }
  });
  mockHarness.committedEffects = [];
  flushScheduledWrites();
}

// Runs `fn` as if on the UI runtime: shared-value `set()` calls inside apply
// immediately instead of being queued.
function uiRuntime(fn: () => void) {
  mockHarness.onUiRuntime = true;
  try {
    fn();
  } finally {
    mockHarness.onUiRuntime = false;
  }
}

// Mirrors the native HeaderMotionRefreshPhase Int32 constants — events cross
// the boundary as wire codes, not as the public string phases.
const NATIVE_PHASE = {
  Idle: 0,
  Pulling: 1,
  Ready: 2,
  Refreshing: 3,
  Cancelling: 4,
  Finishing: 5,
  Disabled: 6,
} as const;

// The `useEvent` handler is a worklet — native events run it on the UI runtime.
function fireProgress(event: {
  progress: number;
  pullDistance: number;
  triggerDistance: number;
  phase: number;
}) {
  uiRuntime(() => mockHarness.eventHandler!(event));
}

const state = () =>
  mockHarness.state as unknown as {
    progress: FakeSharedValue<number | TimingMarker>;
    rawProgress: FakeSharedValue<number>;
    pullDistance: FakeSharedValue<number>;
    triggerDistance: FakeSharedValue<number>;
    phase: FakeSharedValue<RefreshPhase>;
  };

beforeEach(() => {
  mockHarness.slots = [];
  mockHarness.slotIndex = 0;
  mockHarness.pendingEffects = [];
  mockHarness.committedEffects = [];
  mockHarness.scheduledWrites = [];
  mockHarness.onUiRuntime = false;
  mockHarness.eventHandler = undefined;
  mockHarness.state = {
    progress: mockMakeShared(0),
    rawProgress: mockMakeShared(0),
    pullDistance: mockMakeShared(0),
    triggerDistance: mockMakeShared(0),
    phase: mockMakeShared(RefreshPhase.Idle),
  } as Record<string, FakeSharedValue<unknown>>;
  mockHarness.owner = mockMakeShared<number | null>(null);
});

describe('RefreshControl presentation state machine', () => {
  it('mirrors native pull events into the shared state', () => {
    render();

    fireProgress({
      progress: 0.5,
      pullDistance: 40,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Pulling,
    });

    expect(state().progress.get()).toBe(0.5);
    expect(state().rawProgress.get()).toBe(0.5);
    expect(state().pullDistance.get()).toBe(40);
    expect(state().triggerDistance.get()).toBe(80);
    expect(state().phase.get()).toBe(RefreshPhase.Pulling);
    // The phase members are string literals, so plain string comparison is
    // part of the public contract.
    expect(state().phase.get()).toBe('pulling');

    fireProgress({
      progress: 1.2,
      pullDistance: 96,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Ready,
    });

    expect(state().progress.get()).toBe(1.2);
    expect(state().phase.get()).toBe(RefreshPhase.Ready);
  });

  it('animates progress to 1 exactly once when refresh commits', () => {
    render();

    fireProgress({
      progress: 2.13,
      pullDistance: 170,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Refreshing,
    });

    expect(state().progress.get()).toEqual(timing(1, 160));
    expect(state().rawProgress.get()).toBe(2.13);

    // Simulate the animation being mid-flight, then a repeated Refreshing
    // event — the animation must not restart.
    uiRuntime(() => state().progress.set(0.97));
    fireProgress({
      progress: 1,
      pullDistance: 80,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Refreshing,
    });

    expect(state().progress.get()).toBe(0.97);
  });

  it('animates progress to 0 exactly once while settling, and lets the in-flight settle finish at idle', () => {
    render();

    fireProgress({
      progress: 1,
      pullDistance: 80,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Refreshing,
    });
    fireProgress({
      progress: 0.8,
      pullDistance: 64,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Finishing,
    });

    expect(state().progress.get()).toEqual(timing(0, 180));

    uiRuntime(() => state().progress.set(0.4));
    fireProgress({
      progress: 0.3,
      pullDistance: 24,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Finishing,
    });

    expect(state().progress.get()).toBe(0.4);

    // Native's settle clock can reach Idle a frame before the JS animation
    // lands — the idle event must not cut the animation's final frames.
    fireProgress({
      progress: 0,
      pullDistance: 0,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Idle,
    });

    expect(state().progress.get()).toBe(0.4);
    expect(state().phase.get()).toBe(RefreshPhase.Idle);
    expect(mockHarness.owner.get()).toBeNull();
  });

  it('snaps progress at idle when no settle preceded it', () => {
    render();

    fireProgress({
      progress: 0.4,
      pullDistance: 32,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Pulling,
    });
    fireProgress({
      progress: 0,
      pullDistance: 0,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Idle,
    });

    expect(state().progress.get()).toBe(0);
    expect(state().phase.get()).toBe(RefreshPhase.Idle);
  });

  it('settles from a cancelled pull', () => {
    render();

    fireProgress({
      progress: 0.4,
      pullDistance: 32,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Pulling,
    });
    fireProgress({
      progress: 0.35,
      pullDistance: 28,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Cancelling,
    });

    expect(state().progress.get()).toEqual(timing(0, 180));
    expect(state().phase.get()).toBe(RefreshPhase.Cancelling);
  });

  it('honors custom and zero durations', () => {
    render({ progressCommitDuration: 0, progressSettleDuration: 320 });

    fireProgress({
      progress: 1.4,
      pullDistance: 112,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Refreshing,
    });

    // Zero duration must set the value directly instead of animating.
    expect(state().progress.get()).toBe(1);

    fireProgress({
      progress: 0.9,
      pullDistance: 72,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Finishing,
    });

    expect(state().progress.get()).toEqual(timing(0, 320));
  });

  it('drives the refreshing state from the controlled refreshing prop', () => {
    render({ triggerDistance: 100 });
    render({ triggerDistance: 100, refreshing: true });

    expect(state().phase.get()).toBe(RefreshPhase.Refreshing);
    expect(state().rawProgress.get()).toBe(1);
    expect(state().pullDistance.get()).toBe(100);
    expect(state().progress.get()).toEqual(timing(1, 160));
  });

  it('publishes the trigger distance on the first controlled-refresh commit', () => {
    // The shared trigger distance starts at 0 and is written by an effect in
    // the same commit. That write is queued onto the UI runtime, so the
    // refreshing branch must derive the distance from the prop rather than
    // reading the shared value back.
    render({ triggerDistance: 120, refreshing: true });

    expect(state().triggerDistance.get()).toBe(120);
    expect(state().pullDistance.get()).toBe(120);
  });

  it('clamps a non-positive trigger distance to 1, like native', () => {
    render({ triggerDistance: 0, refreshing: true });

    expect(state().triggerDistance.get()).toBe(1);
    expect(state().pullDistance.get()).toBe(1);
  });

  it('does not double-animate when the controlled prop confirms a native refresh', () => {
    render();

    fireProgress({
      progress: 1.1,
      pullDistance: 88,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Refreshing,
    });

    expect(state().progress.get()).toEqual(timing(1, 160));
    uiRuntime(() => state().progress.set(0.9));

    // JS confirms the refresh that native already started.
    render({ refreshing: true });

    expect(state().progress.get()).toBe(0.9);
    expect(state().phase.get()).toBe(RefreshPhase.Refreshing);
  });

  it('resets the state when disabled', () => {
    render();

    fireProgress({
      progress: 0.6,
      pullDistance: 48,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Pulling,
    });

    render({ enabled: false });

    expect(state().phase.get()).toBe(RefreshPhase.Disabled);
    expect(state().progress.get()).toBe(0);
    expect(state().rawProgress.get()).toBe(0);
    expect(state().pullDistance.get()).toBe(0);
  });

  it('settles the presentation when the owning control unmounts mid-pull', () => {
    render();

    fireProgress({
      progress: 0.7,
      pullDistance: 56,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Pulling,
    });

    unmount();

    expect(state().phase.get()).toBe(RefreshPhase.Cancelling);
    expect(state().rawProgress.get()).toBe(0);
    expect(state().pullDistance.get()).toBe(0);

    const marker = state().progress.get() as TimingMarker;
    expect(marker.toValue).toBe(0);
    expect(marker.duration).toBe(180);

    // Completing the settle animation reaches Idle and releases ownership.
    uiRuntime(() => marker.callback?.(true));
    expect(state().phase.get()).toBe(RefreshPhase.Idle);
    expect(mockHarness.owner.get()).toBeNull();
  });

  it('leaves the shared state alone when a non-owner unmounts', () => {
    render();

    // Another control is mid-refresh and owns the shared state.
    uiRuntime(() => {
      mockHarness.owner.set(-1);
      state().phase.set(RefreshPhase.Refreshing);
      state().progress.set(1);
      state().rawProgress.set(1);
      state().pullDistance.set(80);
    });

    unmount();

    expect(state().phase.get()).toBe(RefreshPhase.Refreshing);
    expect(state().progress.get()).toBe(1);
    expect(state().rawProgress.get()).toBe(1);
    expect(state().pullDistance.get()).toBe(80);
    expect(mockHarness.owner.get()).toBe(-1);
  });

  it('hands over an active controlled refresh instead of resetting on unmount', () => {
    render({ refreshing: true });

    expect(state().phase.get()).toBe(RefreshPhase.Refreshing);

    unmount();

    // Other controls sharing the `refreshing` prop keep driving the refresh;
    // the header must not snap to idle mid-refresh.
    expect(state().phase.get()).toBe(RefreshPhase.Refreshing);
    expect(state().pullDistance.get()).toBe(80);
    expect(mockHarness.owner.get()).toBeNull();
  });

  it('ignores passive events from a non-owner', () => {
    render();

    uiRuntime(() => mockHarness.owner.set(-1));
    fireProgress({
      progress: 0.5,
      pullDistance: 40,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Finishing,
    });

    expect(state().phase.get()).toBe(RefreshPhase.Idle);
    expect(state().rawProgress.get()).toBe(0);
    expect(mockHarness.owner.get()).toBe(-1);
  });

  it('claims the shared state on real pull activity', () => {
    render();

    uiRuntime(() => mockHarness.owner.set(-1));
    fireProgress({
      progress: 0.5,
      pullDistance: 40,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Pulling,
    });

    expect(state().phase.get()).toBe(RefreshPhase.Pulling);
    expect(state().progress.get()).toBe(0.5);
    expect(mockHarness.owner.get()).not.toBe(-1);
    expect(mockHarness.owner.get()).not.toBeNull();
  });

  it('returns the phase to idle when re-enabled', () => {
    render();
    render({ enabled: false });

    expect(state().phase.get()).toBe(RefreshPhase.Disabled);

    render({ enabled: true });

    expect(state().phase.get()).toBe(RefreshPhase.Idle);
    expect(state().progress.get()).toBe(0);
    expect(mockHarness.owner.get()).toBeNull();
  });

  it('returns to refreshing when re-enabled during a controlled refresh', () => {
    render({ refreshing: true });
    render({ refreshing: true, enabled: false });

    expect(state().phase.get()).toBe(RefreshPhase.Disabled);

    render({ refreshing: true, enabled: true });

    expect(state().phase.get()).toBe(RefreshPhase.Refreshing);
    expect(state().rawProgress.get()).toBe(1);
    expect(state().pullDistance.get()).toBe(80);
  });

  it('accepts an unowned idle event that clears a disabled state', () => {
    render();

    uiRuntime(() => state().phase.set(RefreshPhase.Disabled));
    fireProgress({
      progress: 0,
      pullDistance: 0,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Idle,
    });

    expect(state().phase.get()).toBe(RefreshPhase.Idle);
    expect(mockHarness.owner.get()).toBeNull();
  });

  it('settles an orphaned controlled refresh on mount', () => {
    // A previous owner unmounted mid-refresh and `refreshing` ended while no
    // control was mounted — the preserved Refreshing state has no native
    // driver left, so a control mounting into it must settle it.
    uiRuntime(() => {
      state().phase.set(RefreshPhase.Refreshing);
      state().progress.set(1);
      state().rawProgress.set(1);
      state().pullDistance.set(80);
    });

    render();

    expect(state().phase.get()).toBe(RefreshPhase.Finishing);
    expect(state().rawProgress.get()).toBe(0);
    expect(state().pullDistance.get()).toBe(0);

    const marker = state().progress.get() as TimingMarker;
    expect(marker.toValue).toBe(0);
    expect(marker.duration).toBe(180);

    uiRuntime(() => marker.callback?.(true));
    expect(state().phase.get()).toBe(RefreshPhase.Idle);
    expect(mockHarness.owner.get()).toBeNull();
  });

  it('adopts an orphaned settle stream', () => {
    render();

    // Owner released (e.g. the previous owner unmounted mid-refresh); this
    // control's Finishing stream should pick the state up and drive it home.
    fireProgress({
      progress: 0.8,
      pullDistance: 64,
      triggerDistance: 80,
      phase: NATIVE_PHASE.Finishing,
    });

    expect(state().phase.get()).toBe(RefreshPhase.Finishing);
    expect(state().progress.get()).toEqual(timing(0, 180));
    expect(mockHarness.owner.get()).not.toBeNull();
  });

  it('passes sanitized configuration to the native component', () => {
    const element = render({
      triggerDistance: 120,
      refreshConfirmationTimeout: 199.6,
      progressSettleDuration: -50,
    });

    expect(element.props.triggerDistance).toBe(120);
    expect(element.props.keepScrollContentPinned).toBe(true);
    expect(element.props.refreshConfirmationTimeout).toBe(200);
    expect(element.props.progressSettleDuration).toBe(0);
    expect(state().triggerDistance.get()).toBe(120);
  });

  it('maps unknown native phase codes to idle', () => {
    render();

    fireProgress({
      progress: 0,
      pullDistance: 0,
      triggerDistance: 80,
      phase: 99,
    });

    expect(state().phase.get()).toBe(RefreshPhase.Idle);
  });

  it('excludes the built-in visual props from the public type', () => {
    // The control is headless — the RN indicator's visual props are not part
    // of the API. These assignments must stay type errors.
    const withTintColor: HeaderMotionRefreshControlProps = {
      refreshing: false,
      // @ts-expect-error tintColor is deliberately not accepted
      tintColor: 'red',
    };
    const withOffset: HeaderMotionRefreshControlProps = {
      refreshing: false,
      // @ts-expect-error progressViewOffset is deliberately not accepted
      progressViewOffset: 32,
    };

    expect(withTintColor.refreshing).toBe(false);
    expect(withOffset.refreshing).toBe(false);
  });

  it('forwards an internally injected progressViewOffset to native', () => {
    // resolveRefreshControl clones the element with the header-derived offset;
    // the prop is not public API, but the injected value must still flow
    // through to the native component, which keeps it in its spec.
    const element = render({
      progressViewOffset: 64,
    } as Partial<HeaderMotionRefreshControlProps>);

    expect(element.props.progressViewOffset).toBe(64);
  });
});
