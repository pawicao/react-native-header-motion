---
sidebar_position: 2
title: Animating with progress
description: Use the progress shared value to build any scroll-driven animation.
---

# Animating with progress

This is where the fun begins. You've wired up your header with `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic` — now you can use the `progress` shared value to animate anything you want.

## Getting the values

The `useMotionProgress()` hook returns two shared values:

```tsx
const { progress, progressThreshold } = useMotionProgress();
```

- **`progress`** — a `SharedValue<number>` going from `0` (header fully expanded) to `1` (header fully collapsed)
- **`progressThreshold`** — a `SharedValue<number>` containing the collapse distance in pixels

Both are Reanimated shared values, so you use them inside `useAnimatedStyle` and other Reanimated APIs.

## Common animation patterns

Below are building blocks you can mix and match. Each one is a `useAnimatedStyle` call — combine as many as you need.

### Slide the header up

The most fundamental pattern. Move the entire header container upward by the threshold distance so the dynamic section scrolls off screen:

```tsx
const containerStyle = useAnimatedStyle(() => {
  const threshold = progressThreshold.get();
  return {
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [0, -threshold]) },
    ],
  };
});
```

### Sticky element (counter-translate)

Make an element appear to stay fixed while the rest of the header moves. Apply an equal-and-opposite translation:

```tsx
const stickyStyle = useAnimatedStyle(() => {
  const threshold = progressThreshold.get();
  return {
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [0, threshold]) },
    ],
  };
});
```

### Opacity fade

Fade content out before the header fully collapses — in this example, it disappears by the time `progress` reaches `0.6`:

```tsx
const fadeStyle = useAnimatedStyle(() => ({
  opacity: interpolate(progress.get(), [0, 0.6], [1, 0]),
}));
```

### Scale

Shrink content as the header collapses:

```tsx
const scaleStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: interpolate(progress.get(), [0, 1], [1, 0.8]) },
  ],
}));
```

### Parallax

Move content at a fraction of the scroll speed for a depth effect:

```tsx
const parallaxStyle = useAnimatedStyle(() => {
  const threshold = progressThreshold.get();
  return {
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [0, threshold * 0.5]) },
    ],
  };
});
```

### Color transition

Use `interpolateColor` for smooth color shifts:

```tsx
import { interpolateColor } from 'react-native-reanimated';

const backgroundStyle = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(
    progress.get(),
    [0, 1],
    ['#304077', '#1a1a2e']
  ),
}));
```

## Combining patterns

It's just Reanimated. Because `progress` is a standard Reanimated `SharedValue`, you're not limited to the patterns above — anything Reanimated can do, you can drive with `progress`. These patterns are designed to compose; a typical header might combine a container slide, a sticky element, and a fade + scale on the dynamic section — exactly like the [Quick Start](../quick-start) example.

## What's next?

Learn about the scrollable components that drive the progress value in [Default scrollables](./default-scrollables).
