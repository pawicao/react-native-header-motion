---
sidebar_position: 1
title: Dynamic header measurement
description: How HeaderMotion measures your header and derives the collapse distance.
---

# Dynamic header measurement

Header Motion automatically measures your header so it knows exactly how many pixels of scroll should collapse it. Understanding how this works will help you build headers that behave predictably.

## Two layers of measurement

There are two components involved:

- **`HeaderMotion.Header`** measures the **total height** of your header via `onLayout`. This value is used to offset your scrollable content so it appears below the header.
- **`HeaderMotion.Header.Dynamic`** measures the **collapsible part** — the section that should disappear as the user scrolls. This value feeds into `progressThreshold`, which determines the scroll distance for `progress` to go from `0` to `1`.

```tsx
<HeaderMotion.Header>
  {/* This stays visible — it's outside Header.Dynamic */}
  <View style={styles.stickyTitle}>
    <Text>My App</Text>
  </View>

  {/* This is the collapsible section */}
  <View style={{ overflow: 'hidden' }}>
    <HeaderMotion.Header.Dynamic>
      <View style={styles.dynamicContent}>
        <Text>Welcome back!</Text>
      </View>
    </HeaderMotion.Header.Dynamic>
  </View>
</HeaderMotion.Header>
```

## `progressThreshold`

The `progressThreshold` prop on `HeaderMotion` controls how many pixels of scroll it takes for `progress` to go from `0` (expanded) to `1` (collapsed). You can pass it in two ways:

**As a number** — a fixed pixel value:

```tsx
<HeaderMotion progressThreshold={120}>
```

**As a function** — receives the measured dynamic height and returns the threshold:

```tsx
<HeaderMotion progressThreshold={(measuredDynamic) => measuredDynamic + 20}>
```

When you don't pass `progressThreshold` at all, the default behavior is `(measuredDynamic) => measuredDynamic` — the collapse distance equals the dynamic section's height exactly.

## Custom measurement with `measureDynamic`

By default, `HeaderMotion.Header.Dynamic` measures its height using the `onLayout` event:

```tsx
(e) => e.nativeEvent.layout.height;
```

If you need a different measurement strategy — for example, measuring other properties or applying a multiplier — you can pass a custom `measureDynamic` function to `HeaderMotion`:

```tsx
<HeaderMotion measureDynamic={(e) => e.nativeEvent.layout.height * 0.75}>
```

## `measureDynamicMode`

The `measureDynamicMode` prop on `HeaderMotion` controls **when** the dynamic section is re-measured:

- **`'mount'`** (default) — measures once when `HeaderMotion.Header.Dynamic` first mounts. Subsequent layout changes are ignored.
- **`'update'`** — re-measures every time the layout changes. Use this when your dynamic section's height can change after mount (e.g., dynamic content loading).

```tsx
<HeaderMotion measureDynamicMode="update">
```

:::caution
Using `'update'` mode means the `progressThreshold` can change mid-scroll, which may cause visual jumps. Prefer `'mount'` unless you have a genuine need for dynamic re-measurement.
:::

## `asChild`

Both `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic` accept an `asChild` prop. When `true`, the component does not render its own `Animated.View` — instead, it forwards measurement behavior to the single child element you provide.

```tsx
import { LinearGradient } from 'expo-linear-gradient';

<HeaderMotion.Header asChild>
  <LinearGradient colors={['#304077', '#1a1a2e']}>
    {/* your header content */}
  </LinearGradient>
</HeaderMotion.Header>;
```

This is useful when you need full control over the wrapper element.

## What's next?

Now that you know how measurement works, head over to [Fixed progress threshold](./fixed-progress-threshold) to learn how to skip dynamic measurement when you already know the collapse distance.
