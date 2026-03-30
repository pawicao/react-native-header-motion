---
sidebar_position: 10
title: useMotionProgress
---

# useMotionProgress

The primary hook for reading header animation state. Returns the shared `progress` value and the `progressThreshold`.

## Signature

```tsx
function useMotionProgress(): {
  progress: SharedValue<number>;
  progressThreshold: SharedValue<number>;
}
```

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `progress` | `SharedValue<number>` | Ranges from `0` (expanded) to `1` (collapsed). Behavior outside this range depends on `progressExtrapolation`. |
| `progressThreshold` | `SharedValue<number>` | The collapse distance in pixels. Read it inside worklets with `.get()`. |

## Usage

```tsx
import { useMotionProgress } from 'react-native-header-motion';
import { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  const style = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    return {
      transform: [
        {
          translateY: interpolate(
            progress.get(),
            [0, 1],
            [0, -threshold],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return <Animated.View style={style}>{/* ... */}</Animated.View>;
}
```

Must be called within a `HeaderMotion` or `HeaderMotion.NavigationBridge` subtree.
