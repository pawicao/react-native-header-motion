---
sidebar_position: 14
title: useRefreshControl
---

# useRefreshControl

Returns the HeaderMotion-owned refresh state written by [`HeaderMotion.RefreshControl`](./header-motion-refresh-control). Use it to build custom refresh UI anywhere inside the same `HeaderMotion` tree — typically in the header.

## Signature

```tsx
function useRefreshControl(): RefreshControlState;
```

## Returns

| Property          | Type                          | Description                                                                                                    |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `progress`        | `SharedValue<number>`         | UI-ready presentation progress. `1` means the trigger distance was reached; values above `1` are overshoot.    |
| `rawProgress`     | `SharedValue<number>`         | Exact progress emitted by native, without presentation smoothing. Prefer `progress` for visuals.               |
| `pullDistance`    | `SharedValue<number>`         | Current pull distance in points/dp.                                                                            |
| `triggerDistance` | `SharedValue<number>`         | Distance required to trigger a refresh.                                                                        |
| `phase`           | `SharedValue<RefreshPhase>`   | Discrete lifecycle phase (see below).                                                                          |
| `overshoot`       | `DerivedValue<number>`        | `max(0, progress - 1)`, exposed for convenience.                                                               |
| `isPulling`       | `DerivedValue<boolean>`       | `phase === RefreshPhase.Pulling`.                                                                              |
| `isReady`         | `DerivedValue<boolean>`       | `phase === RefreshPhase.Ready` — releasing now will trigger a refresh.                                         |
| `isRefreshing`    | `DerivedValue<boolean>`       | `phase === RefreshPhase.Refreshing`.                                                                           |
| `isSettling`      | `DerivedValue<boolean>`       | `phase` is `Cancelling` or `Finishing`.                                                                        |
| `isActive`        | `DerivedValue<boolean>`       | Any phase other than `Idle` and `Disabled`.                                                                    |

## `progress` vs `rawProgress`

`rawProgress` is the exact value the native side emits. It can jump: right before a refresh commits, the last pull event may report an overshoot like `2.13`, and when the refresh commits the value snaps to `1`.

`progress` is the presentation stream meant for UI. It follows `rawProgress` while the user is pulling, but *animates* the discontinuities away: it eases from overshoot down to `1` over `progressCommitDuration` when the refresh commits, and eases from its current value down to `0` over `progressSettleDuration` when the refresh is cancelled or finishes. Build your visuals from `progress` unless you specifically need the unsmoothed stream.

## `RefreshPhase`

`RefreshPhase` is a const object exported from the package root (`import { RefreshPhase } from 'react-native-header-motion'`), and the `RefreshPhase` type is the union of its string values. Because the members are the string literals themselves, both comparison styles type-check, narrow, and work inside worklets:

```tsx
const RefreshPhase = {
  Idle: 'idle', // no active pull or refresh
  Pulling: 'pulling', // pulling, below the trigger distance
  Ready: 'ready', // past the trigger distance; release will refresh
  Refreshing: 'refreshing', // refresh in progress
  Cancelling: 'cancelling', // released below the threshold; settling back
  Finishing: 'finishing', // refresh done; settling back
  Disabled: 'disabled', // the control is disabled
} as const;

type RefreshPhase = (typeof RefreshPhase)[keyof typeof RefreshPhase];
```

```tsx
// Equivalent — pick whichever reads better:
if (refresh.phase.get() === RefreshPhase.Ready) { /* ... */ }
if (refresh.phase.get() === 'ready') { /* ... */ }

// And the union type gives exhaustive switches:
switch (refresh.phase.get()) {
  case 'pulling': // ...
}
```

`Cancelling` and `Finishing` both settle back to `Idle`; they are distinct so animations can differentiate an abandoned pull from a completed refresh. Most UI can just use `isSettling`. The `RefreshControlState` type is exported alongside `RefreshPhase`.

## Usage

```tsx
import { useRefreshControl } from 'react-native-header-motion';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

function RefreshIndicator() {
  const refresh = useRefreshControl();

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(refresh.progress.get(), 1),
    transform: [
      { translateY: refresh.progress.get() * 48 },
      { scale: 0.8 + Math.min(refresh.progress.get(), 1) * 0.2 },
    ],
  }));

  return <Animated.View style={style}>{/* ... */}</Animated.View>;
}
```

Must be called within a `HeaderMotion` subtree.
