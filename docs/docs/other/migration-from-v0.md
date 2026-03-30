---
sidebar_position: 1
title: Migration from v0
description: How to upgrade from v0.3.x to v1.
---

# Migration from v0

This guide covers migration from `v0.3.x` to the current `v1` API. The API change is substantial, but the migration is usually straightforward and the result is a much better developer experience.

:::info
If you are not migrating yet and need the old docs, see the [README on the v0 branch](https://github.com/pawicao/react-native-header-motion/blob/v0/README.md).
:::

## What changed at a high level

The biggest shift is from a **prop-passing header API** to a **context-first header API**:

- `HeaderMotion.Header` is no longer a render-prop bridge — it's the actual header container
- `AnimatedHeaderBase` / `HeaderBase` have been removed
- Measurement wiring now lives in `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic`
- Navigation headers use explicit `Bridge` + `NavigationBridge`
- `useMotionProgress()` is intentionally narrower

## Upgrade checklist

- [ ] Add `react-native-gesture-handler` as a peer dependency if you don't already have it
- [ ] Replace render-prop `HeaderMotion.Header` with `HeaderMotion.Bridge` + `HeaderMotion.NavigationBridge`
- [ ] Replace `AnimatedHeaderBase` / `HeaderBase` with `HeaderMotion.Header`
- [ ] Replace manual `measureDynamic` wiring with `HeaderMotion.Header.Dynamic`
- [ ] Remove `WithCollapsibleHeaderProps` / `WithCollapsiblePagedHeaderProps` usage
- [ ] Update `useMotionProgress()` to read `progressThreshold` as a `SharedValue`
- [ ] Review custom scrollable integrations

## 1. Peer dependencies changed

v1 requires:

| Package | Version |
|---------|---------|
| `react-native-gesture-handler` | `^2.0.0` |
| `react-native-reanimated` | `>= 4.0.0` |
| `react-native-worklets` | `>= 0.4.0` |

`react-native-gesture-handler` is new to the peer surface because header panning is built on it.

## 2. HeaderMotion.Header is no longer a render prop

### Before (v0.3.x)

```tsx
<HeaderMotion.Header>
  {(headerProps) => (
    <Stack.Screen
      options={{
        header: () => <MyHeader {...headerProps} />,
      }}
    />
  )}
</HeaderMotion.Header>
```

### After (v1)

```tsx
<HeaderMotion.Bridge>
  {(ctx) => (
    <Stack.Screen
      options={{
        header: () => (
          <HeaderMotion.NavigationBridge value={ctx}>
            <MyHeader />
          </HeaderMotion.NavigationBridge>
        ),
      }}
    />
  )}
</HeaderMotion.Bridge>
```

Inside `MyHeader`, call `useMotionProgress()` normally.

## 3. AnimatedHeaderBase and HeaderBase were removed

### Before (v0.3.x)

```tsx
function MyHeader({
  progress,
  progressThreshold,
  measureTotalHeight,
  measureDynamic,
}: WithCollapsibleHeaderProps) {
  return (
    <AnimatedHeaderBase onLayout={measureTotalHeight}>
      <Animated.View onLayout={measureDynamic}>
        {/* collapsible part */}
      </Animated.View>
    </AnimatedHeaderBase>
  );
}
```

### After (v1)

```tsx
function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic>
        {/* collapsible part */}
      </HeaderMotion.Header.Dynamic>
    </HeaderMotion.Header>
  );
}
```

Measurement wiring is handled automatically by `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic`.

## 4. useMotionProgress() is narrower

**Before:** returned `progress`, `progressThreshold`, `measureTotalHeight`, `measureDynamic`.

**After:** returns only `progress` and `progressThreshold`.

If you need the full bridge value, use `useHeaderMotionBridge()`.

## 5. progressThreshold is now a SharedValue

The prop configuration is the same (number or function), but at runtime `progressThreshold` from `useMotionProgress()` is a `SharedValue<number>`.

### Before (v0.3.x)

```tsx
const translateY = interpolate(
  progress.value,
  [0, 1],
  [0, -progressThreshold],
  Extrapolation.CLAMP
);
```

### After (v1)

```tsx
const threshold = progressThreshold.get();
const translateY = interpolate(
  progress.get(),
  [0, 1],
  [0, -threshold],
  Extrapolation.CLAMP
);
```

## 6. Removed type exports

`WithCollapsibleHeaderProps` and `WithCollapsiblePagedHeaderProps` have been removed. Headers now read from context via `useMotionProgress()`.

## 7. Custom scrollable integrations

- Prefer `createHeaderMotionScrollable()` for reusable custom scrollables
- `useScrollManager()` now returns `scrollableProps` and `headerMotionContext`
- `headerMotionContext.contentContainerMinHeight` replaces old `minHeightContentContainerStyle`
- `ensureScrollableContentMinHeight` is the explicit opt-in for min-height behavior

## Side-by-side comparison

<details>
<summary>Full before/after example</summary>

### Before (v0.3.x)

```tsx
import HeaderMotion, {
  AnimatedHeaderBase,
  type WithCollapsibleHeaderProps,
} from 'react-native-header-motion';

function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Header>
        {(headerProps) => (
          <Stack.Screen
            options={{
              header: () => <MyHeader {...headerProps} />,
            }}
          />
        )}
      </HeaderMotion.Header>
      <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function MyHeader({
  progress,
  progressThreshold,
  measureTotalHeight,
  measureDynamic,
}: WithCollapsibleHeaderProps) {
  return (
    <AnimatedHeaderBase onLayout={measureTotalHeight}>
      <Animated.View onLayout={measureDynamic}>
        {/* dynamic content */}
      </Animated.View>
      <Text>Sticky title</Text>
    </AnimatedHeaderBase>
  );
}
```

### After (v1)

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';

function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <MyHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic>
        {/* dynamic content */}
      </HeaderMotion.Header.Dynamic>
      <Text>Sticky title</Text>
    </HeaderMotion.Header>
  );
}
```

</details>
