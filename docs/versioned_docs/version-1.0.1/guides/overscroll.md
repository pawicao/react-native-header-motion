---
sidebar_position: 13
title: Overscroll
---

# Overscroll

By default, `progress` is clamped between 0 and 1. But sometimes you want the header to react when the user pulls down past the top of the scroll — for example, scaling up a hero image as they overscroll.

## Extending extrapolation

The `progressExtrapolation` prop on `HeaderMotion` controls how progress behaves outside the 0–1 range. To enable overscroll animation, extend extrapolation on the left side:

```tsx
import { Extrapolation } from 'react-native-reanimated';

<HeaderMotion
  progressExtrapolation={{
    extrapolateLeft: Extrapolation.EXTEND,
    extrapolateRight: Extrapolation.CLAMP,
  }}
>
  {/* header and scrollable */}
</HeaderMotion>;
```

Now `progress` can go below 0 when the user scrolls past the top.

## Example: scaling an image

With overscroll enabled, you can use negative progress values to drive animations. Here we scale an image up as the user pulls down:

```tsx
const imageStyle = useAnimatedStyle(() => {
  const scale = interpolate(progress.get(), [-1, 0, 1], [1.5, 1.2, 1]);
  return { transform: [{ scale }] };
});
```

At rest (`progress = 0`), the image is at 1.2× scale. As the user collapses the header (`progress → 1`), it shrinks to 1×. And when they overscroll (`progress → -1`), it grows to 1.5×.

## How it works

The scroll handler continues tracking min/current scroll positions as normal — extrapolation only affects how `progress` is derived from the scroll position. You're not changing the scroll behavior, just unlocking additional range for your animations.

## What's next?

Learn how to access the underlying scrollable ref in [External refs](./external-refs).
