# Review: headless refresh control (`experiment/refresh-control`)

Reviewed: 2026-07-07, commits `2caf700`..`300f327` vs `main`, against the spec in
`agents/specs/refresh-control.md` and React Native 0.83 sources.

## Verdict

The architecture is the right one and matches the spec: real Fabric native
components on both platforms (no app-level workarounds), direct native events
consumed on the UI thread through Reanimated `useEvent` (no `runOnJS`), a
proper phase state machine, and a headless public API. The branch was not
mergeable as-is — it shipped debug logging in the hot path and had a handful of
native lifecycle/race bugs — but all of those are fixed in this pass (see
"Applied fixes"). What remains before stabilizing is listed under
"Recommendations".

## What is solid (verified against RN sources)

- **iOS integration point.** Conforming to `RCTCustomPullToRefreshViewProtocol`
  and attaching via `RCTScrollViewComponentView findScrollViewComponentViewForView:`
  is exactly how RN's own `RCTPullToRefreshViewComponentView` integrates.
  Verified in RN 0.83: the scroll view skips protocol-conforming children when
  tracking its content view, so the control is structurally invisible.
- **Android integration point.** RN's `ScrollView` on Android clones whatever
  element is passed as `refreshControl` and makes it the *parent* of the native
  scroll view. Building the control as a `ViewGroup` that owns
  `onInterceptTouchEvent`, checks `canScrollVertically(-1)`, applies touch
  slop + axis dominance, and notifies JS through `NativeGestureUtil` follows
  the `SwipeRefreshLayout` playbook the spec asked for.
- **Event pipeline.** Direct events (`onRefreshProgress`) → `useEvent` worklet
  → shared values. Phase-keyed event coalescing on Android
  (`getCoalescingKey() = phase`) is a nice touch — progress events coalesce
  within a frame but phase transitions are never lost.
- **JS API design.** Splitting `rawProgress` (native truth) from `progress`
  (UI-ready, with commit/settle easing) plus derived booleans is a good
  consumer surface. The controlled `refreshing` semantics follow RN's model.
- **Codegen/build plumbing.** `codegenConfig.ios.components` is the correct
  new-API shape for RN 0.83 (verified in
  `generateRCTThirdPartyComponents.js`), the podspec uses
  `install_modules_dependencies`, and `example/react-native.config.js`
  correctly registers the local library for autolinking + codegen.

## Applied fixes

Ordered by severity; all are in the working tree of this branch.

1. **Debug logging left in the hot path** — `src/components/HeaderMotion.tsx`
   had six `useAnimatedReaction` blocks `console.log`ging phase/progress/pull
   distance *on every frame of every pull* (UI-thread worklets scheduling log
   calls). Removed, along with the now-unused `refreshPhaseToString` helper.
2. **`resolveRefreshControl` could silently discard the headless control** —
   `injectProgressViewOffset` replaces the element with `ResolvedRefreshControl`,
   which hardcodes RN's `RefreshControl`, whenever the resolved
   `progressViewOffset` is a SharedValue. The default path is safe today
   (`originalHeaderHeight` is a number), but `useScrollManager` accepts
   `MaybeShared` offsets, and that path would swap
   `HeaderMotion.RefreshControl` for the native spinner with no warning.
   Fixed with a static `isHeaderMotionRefreshControl` marker (avoids an import
   cycle between `utils` and `components`); the headless control never reads
   `progressViewOffset` natively, so the element is preserved as-is.
   Regression tests added in `src/utils/__tests__/refreshControl.test.ts`.
3. **Double `onRefresh` on quick re-pull (both platforms)** — in the window
   between the native `onRefresh` dispatch and JS committing
   `refreshing={true}`, a second pull could fire `onRefresh` again (iOS held
   `_pullDistance` at the trigger while KVO was suppressed; Android's intercept
   only checked the `refreshing` prop). Both platforms now treat
   `phase == Refreshing` as refreshing for gesture gating.
4. **iOS: settle `CADisplayLink` leaked past unmount** — `CADisplayLink`
   retains its target; it was only invalidated in `prepareForRecycle`.
   Unmounting mid-settle kept the view alive and emitting. Now stopped in
   `detachFromScrollView` (which every unmount path hits) with a `dealloc`
   backstop.
5. **iOS: KVO vs display-link race during settle** — after release, the scroll
   view's own bounce-back kept overwriting `_pullDistance` via the
   `contentOffset` observer while the settle display link eased it, and could
   emit `Idle` mid-settle (`Cancelling → Idle → Cancelling → Idle`). The KVO
   path now yields while a settle animation owns the value.
6. **iOS: `updateProps` enabled/refreshing interplay** — the early `return`
   in the enabled-change branch skipped the `refreshing` diff, so
   `enabled: false` + `refreshing: true` in one commit left `_refreshing`
   stale, and re-enabling while refreshing emitted `Idle` instead of
   `Refreshing`. Both flags are now tracked unconditionally and emissions are
   sequenced explicitly.
7. **Android: no controlled-refresh fallback** — iOS settles back 200 ms after
   `onRefresh` if JS never commits `refreshing={true}`; Android stayed in
   `REFRESHING` forever. Added a matching 200 ms `Runnable` fallback,
   cancelled when `refreshing` commits and on window detach.
8. **Android: `refreshing` commit mid-drag was ignored** — `onTouchEvent` kept
   emitting `PULLING`/`READY` over the `REFRESHING` phase and release
   re-dispatched `onRefresh`. The drag is now abandoned (native gesture ended,
   intercept re-allowed) when `refreshing` becomes true mid-drag.
9. **Android: `ValueAnimator.cancel()` fired the end listener** — Android's
   animator invokes `onAnimationEnd` on cancel, so `stopAnimation()` zeroed
   `pullDistancePx` and emitted a spurious `IDLE` before, e.g., `animateToIdle`
   captured its start distance (degenerating the Finishing animation).
   Listeners are stripped before cancelling.
10. **Android: cleanup on detach** — pending settle animator and fallback
    runnable are now cancelled in `onDetachedFromWindow`.
11. **JS: stale context state after unmount** — removing the control mid-
    refresh left `phase`/`progress` frozen (a header spinner driven by
    `isRefreshing` would spin forever). `RefreshControl` now resets the shared
    state to idle on unmount.
12. **Polish** — phase shared value initialized with `RefreshPhase.Idle`
    instead of bare `0`; `keepScrollContentPinned` documented as iOS-only (on
    Android the wrapper intercepts the gesture, so content never moves); docs
    snippet now shows the `useRefreshControl` import; Finishing on Android now
    animates from full progress like iOS.

## Recommendations (not applied)

1. **Android nested scrolling.** The gesture model is intercept-only. A single
   gesture that scrolls the list to the top and *continues* pulling will not
   hand off into a refresh the way `SwipeRefreshLayout`'s
   `NestedScrollingParent` path does, and the pull distance is measured from
   gesture start rather than from the handoff point. The spec explicitly calls
   out "nested scrolling semantics" — implementing `NestedScrollingParent3`
   is the main remaining piece of native work before this stabilizes.
2. **`progressViewOffset` is accepted but unused on both platforms.** That is
   defensible for a headless control (indicator placement belongs to the
   consumer), but it should be documented so users don't expect it to move
   anything.
3. **Pinning mutates RN-owned state.** `keepScrollContentPinned` works by
   transforming `RCTScrollViewComponentView.containerView`. It works today and
   resets cleanly, but it is RN-internal surface — re-verify on RN upgrades.
4. **200 ms fallback can flicker under slow JS.** If a legitimate
   `setRefreshing(true)` commits after the fallback fires, the UI plays
   Finishing → Idle → Refreshing. RN's own controls keep spinning indefinitely
   instead. Consider a longer window or making the fallback duration a prop.
5. **Single shared refresh state.** Two mounted `HeaderMotion.RefreshControl`s
   (multi-`scrollId` setups) write to the same context shared values and their
   effects fight over `triggerDistance`. The spec defers the coordinator —
   fine for v1, but a dev-mode warning on double mount would save users
   confusion.
6. **`children` semantics.** On iOS user children render inside a hidden host
   view; on Android RN replaces them with the wrapped scrollable. The prop
   must stay (Android's host wrapping requires rendering `children`), but the
   docs should state that user-supplied children are not rendered.
7. **Example sprawl.** Seven near-identical `custom-refresh-control*` routes
   are experiment artifacts. Consolidate to one or two canonical examples
   (e.g. the header-spinner one and one phase-driven showcase) before merge.
   Left in place since they look like intentional working material.
8. **Test coverage.** Beyond the resolver regression tests added here, the
   event → shared-value pipeline and phase transitions have no JS tests, and
   there are no native tests. A worklet-level test of the `useEvent` handler's
   phase/duration logic would be cheap and valuable.
9. **Spec file.** `agents/specs/refresh-control.md` was committed as a
   "temporary spec file" — decide whether it should live in the repo
   permanently or move to the PR description.

## Verification

- `yarn typecheck` — clean.
- `yarn lint` — only two pre-existing inline-style warnings in `docs/`.
- `yarn test` — 8 suites, 41 tests passing (3 new resolver regression tests).
- iOS: `xcodebuild` of the example workspace (Debug, simulator) — **BUILD
  SUCCEEDED** with the applied changes.
- Android: `./gradlew :react-native-header-motion:compileDebugKotlin` — **BUILD
  SUCCESSFUL** with the applied changes (requires `ANDROID_HOME` or
  `local.properties`; neither was set in this checkout).
- Runtime behavior (pull gestures on simulator/emulator) was not exercised in
  this pass — do a manual QA round of the example screens on both platforms
  before merging.
