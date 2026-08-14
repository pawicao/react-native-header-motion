---
sidebar_position: 10
title: HeaderMotion.RefreshControl
---

# HeaderMotion.RefreshControl

A headless pull-to-refresh control for HeaderMotion scrollables. It drives the native refresh gesture and lifecycle, but renders no UI of its own — instead it publishes the refresh state as Reanimated shared values that you read with [`useRefreshControl`](./use-refresh-control) to build fully custom refresh visuals, usually in the header.

## Usage

```tsx
import { HeaderMotion } from 'react-native-header-motion';

function Screen() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  return (
    <HeaderMotion.ScrollView
      refreshControl={
        <HeaderMotion.RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* content */}
    </HeaderMotion.ScrollView>
  );
}
```

## Props

Follows React Native's [`RefreshControl`](https://reactnative.dev/docs/refreshcontrol) behavior contract (`refreshing`, `onRefresh`, `enabled`), plus the HeaderMotion-specific props below.

:::note
Because the control is headless, the built-in indicator's visual props (`colors`, `progressBackgroundColor`, `size`, `tintColor`, `title`, `titleColor`) and `progressViewOffset` are deliberately **not** part of the API — passing them is a type error. Build the refresh visuals from [`useRefreshControl`](./use-refresh-control) instead.
:::

| Prop                         | Type         | Default | Description                                                                                                                                                                                                             |
| ---------------------------- | ------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `refreshing`                 | `boolean`    | —       | Controlled refresh state, exactly like the built-in `RefreshControl`. Set it to `true` in `onRefresh` and back to `false` when your work finishes.                                                                      |
| `onRefresh`                  | `() => void` | —       | Called when a released pull crosses `triggerDistance`.                                                                                                                                                                  |
| `enabled`                    | `boolean`    | `true`  | Disables the pull gesture when `false` and moves the phase to `Disabled`.                                                                                                                                               |
| `triggerDistance`            | `number`     | `80`    | Pull distance (in points/dp) that commits the gesture into a refresh. Values below `1` are clamped to `1`. This is the _reported_ `pullDistance`, not finger travel — see the platform note below.                      |
| `keepScrollContentPinned`    | `boolean`    | `true`  | iOS only. Counter-translates the scroll content during the pull so the platform overscroll gap stays hidden while the native bounce is still measured. On Android the pull never moves the content, so this is a no-op. |
| `progressCommitDuration`     | `number`     | `160`   | Duration (ms) of the visual snap from pull overshoot back to `progress = 1` when the refresh commits. Pass `0` to snap instantly.                                                                                       |
| `progressSettleDuration`     | `number`     | `180`   | Duration (ms) of the settle animation back to `progress = 0` after a cancel or finish. The native phase timeline uses the same duration, so `Idle` arrives exactly when the animation completes. Pass `0` to snap.      |
| `refreshConfirmationTimeout` | `number`     | `200`   | How long (ms) the control waits for `refreshing={true}` after `onRefresh` fires before settling back to idle. Pass `0` or a negative value to disable the fallback and wait indefinitely, like the built-in controls.   |

:::warning
With `refreshConfirmationTimeout` disabled (`0` or negative), the control stays in the `Refreshing` phase until you toggle `refreshing`. Pull gestures are blocked for that whole time, so an `onRefresh` handler that can bail out early must still set `refreshing={true}` and back to `false`, or the control never becomes pullable again.
:::

## Behavior notes

- **One refresh state per `HeaderMotion` tree, with single ownership.** The refresh state lives in the HeaderMotion context, because the intended consumer is the header — independent simultaneous refresh controls are deliberately not supported. When several controls are mounted (tabs, pagers), the state has one owner at a time: a control claims ownership when it starts real activity (a pull or a controlled refresh), passive events from non-owners are ignored, and a non-owner unmounting leaves the shared state untouched. If the owning control unmounts mid-gesture the presentation settles gracefully instead of snapping, and an active controlled refresh is handed over so controls sharing the same `refreshing` prop keep driving it — the header keeps showing the refresh even when the user switches tabs mid-refresh. Give all controls in one tree the same `refreshing`/`onRefresh` pair.
- **Re-entry is blocked while refreshing.** New pull gestures are ignored from the moment `onRefresh` fires until the refresh finishes (including the confirmation window before `refreshing={true}` commits), so a refresh can never double-fire.
- **Programmatic refresh works.** Setting `refreshing={true}` without a gesture moves the state to `Refreshing` and animates `progress` to `1`, the same as a pull-triggered refresh.
- **`triggerDistance` is a damped distance, not finger travel.** Both platforms report a resisted pull: iOS measures the scroll view's rubber-banded overscroll, Android applies a `0.5` drag rate on top of the touch slop. The same `triggerDistance` therefore needs roughly twice as much finger travel on Android as the number suggests, and a non-linear amount on iOS. Tune it against the device, not against the raw number.

## See also

- [`useRefreshControl`](./use-refresh-control) — reading the refresh state.
- [Pull to refresh guide](../guides/pull-to-refresh) — choosing between built-in and headless refresh.
