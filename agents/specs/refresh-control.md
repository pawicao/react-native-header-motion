## Native Implementation Direction

### iOS

Build a Fabric native component that integrates with React Native's
`ScrollView` refresh-control path.

The component should:

- Conform to React Native's Fabric pull-to-refresh marker protocol where
  required.
- Attach to the owning `UIScrollView`.
- Avoid rendering default `UIRefreshControl` visuals as the public UI.
- Observe content offset / pan state to compute `pullDistance`, `progress`, and
  `phase`.
- Fire `onRefresh` when the user releases past the trigger threshold.
- Respect the controlled `refreshing` prop.
- Emit direct native events for progress/state changes.

The exact implementation may use `UIRefreshControl` lifecycle primitives where
necessary for native correctness, but the public component must remain headless.

### Android

Build a Fabric native component that behaves like a headless equivalent of
React Native's `AndroidSwipeRefreshLayout` integration.

The component should:

- Wrap or host the scrollable in the same structural position where RN expects
  Android refresh controls.
- Own vertical gesture interception and nested scrolling semantics.
- Check whether the child can scroll up before allowing refresh.
- Track pull distance and trigger threshold natively.
- Fire `onRefresh` when the user releases past the threshold.
- Respect the controlled `refreshing` prop.
- Emit direct native events for progress/state changes.
- Render no default spinner.

The Android implementation should study `SwipeRefreshLayout` behavior rather
than attempt to infer progress from child `onScroll` events. On Android, the
refresh parent owns important gesture interception before the scroll view can
produce useful overscroll data.

## Reanimated Integration

Native progress/state events should be direct events consumed with Reanimated
event handling so shared values update on the UI thread.

Expected JS pattern internally:

```ts
const onRefreshProgress = useEvent(
  (event) => {
    'worklet';
    progress.value = event.progress;
    pullDistance.value = event.pullDistance;
    triggerDistance.value = event.triggerDistance;
    phase.value = event.phase;
  },
  ['onRefreshProgress']
);
```

Do not use `runOnJS`. This project uses Reanimated 4 / Worklets, where UI-to-RN
scheduling should use `scheduleOnRN` when needed.

## Controlled Refresh Semantics

The public behavior should match React Native:

1. User pulls past the threshold and releases.
2. Native component fires `onRefresh`.
3. User sets `refreshing={true}`.
4. Native component remains in `Refreshing`.
5. User sets `refreshing={false}` when work completes.
6. Native component transitions through `Finishing` and returns to `Idle`.

If `onRefresh` fires and the user does not set `refreshing` to true, the control
should behave consistently with React Native's controlled model and settle back.

## Integration With Existing Header Motion Code

The current `resolveRefreshControl` path should continue supporting standard
React Native `RefreshControl`.

New behavior should add:

- `HeaderMotion.RefreshControl`
- `useRefreshControl`
- refresh coordinator state inside the Header Motion tree
- native component codegen/spec files
- native iOS Fabric implementation
- native Android Fabric implementation

The existing `progressViewOffset` injection remains relevant. The new
`HeaderMotion.RefreshControl` should accept the injected offset so pull behavior
starts below the measured header when needed.

## Open Design Questions

These should be resolved during implementation:

- Exact native trigger distance defaults on each platform.
- Whether users can override `triggerDistance`.
- Whether `progress` should reset immediately on tab switch or continue from
  the last active control until the active refresh settles. Current preference:
  continue smoothly through the coordinator's current state.
- Whether `useRefreshControl(scrollId)` should be added later for advanced
  multi-scroll use cases. Current preference: start with `useRefreshControl()`
  only, backed by an internal coordinator.
- Whether `Disabled` should be entered when `onRefresh` is absent, when
  `enabled={false}`, or both.

## Non-Goals

- Replacing React Native's standard `RefreshControl` for users who only need the
  default platform spinner.
- Providing built-in indicator UI.
- Supporting legacy architecture / Paper.
- Implementing app-level wrappers that only approximate native refresh behavior.
