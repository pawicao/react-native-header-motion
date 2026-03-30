---
sidebar_position: 2
title: Fixed progress threshold
description: Skipping dynamic measurement and providing the collapse distance yourself.
---

# Fixed progress threshold

Most of the time, `HeaderMotion.Header.Dynamic` is the right tool — you drop your collapsible content inside it, and the library measures it at runtime. But sometimes you already know exactly how many pixels of scroll should map to `progress = 1`. In those cases, you can skip the dynamic measurement entirely and pass the threshold yourself.

## When to use this

- Your collapsible section has a **fixed, design-time height** and you don't want an extra layout measurement
- You want the progress to reach `1` at a specific scroll offset regardless of the header's actual content
- You're building a simple header where `Header.Dynamic` would be unnecessary complexity

## How it works

Instead of `HeaderMotion.Header.Dynamic`, you pass a numeric `progressThreshold` prop directly to `HeaderMotion`:

```tsx
<HeaderMotion progressThreshold={80}>
  <MyHeader />
  <HeaderMotion.ScrollView>
    {/* content */}
  </HeaderMotion.ScrollView>
</HeaderMotion>
```

When a numeric `progressThreshold` is provided, the library skips dynamic measurement completely. The `progress` shared value will reach `1` exactly when the user has scrolled `80` pixels — or whatever value you pass.

:::note
`progressThreshold` returned by `useMotionProgress()` will be a shared value that holds your fixed number, consistent with the dynamic measurement case. Your animation code stays the same either way.
:::

## Example

Here's a header that uses a fixed 64 px threshold. The dynamic section is just a plain `View` — there's no need to wrap it in `Header.Dynamic`.

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROGRESS_THRESHOLD = 64;

export default function Screen() {
  return (
    <HeaderMotion progressThreshold={PROGRESS_THRESHOLD}>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <FixedThresholdHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>

      <HeaderMotion.ScrollView>
        {/* content */}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function FixedThresholdHeader() {
  const { progress } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progress.get(),
          [0, 1],
          [0, -PROGRESS_THRESHOLD],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.5], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <HeaderMotion.Header
      style={[styles.header, { paddingTop: insets.top + PROGRESS_THRESHOLD }, containerStyle]}
    >
      <Text style={styles.title}>My App</Text>

      {/* No Header.Dynamic needed — just a plain view */}
      <View style={styles.subtitleWrapper}>
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Welcome back!
        </Animated.Text>
      </View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#304077',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    padding: 16,
  },
  subtitleWrapper: {
    overflow: 'hidden',
    height: PROGRESS_THRESHOLD,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
```

## vs. dynamic measurement

| | Fixed `progressThreshold` | `Header.Dynamic` |
|---|---|---|
| Threshold source | You provide a number | Measured from layout |
| Layout dependency | None | Yes |
| Flexibility | Fixed at design time | Adapts to content |
| Good for | Known heights, simple layouts | Layouts with elements of dynamic or unknown size, or when you simply don't want to hardcode a pixel value |

## What's next?

Now that you understand how the threshold works — whether fixed or measured — head to [Animating with progress](./animating-with-progress) to see how to use the `progress` value to drive any animation you like.
