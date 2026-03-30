---
sidebar_position: 3
title: Quick Start
description: Build your first scroll-driven animated header step by step.
---

# Quick Start

In this guide we'll build a collapsible header from scratch. By the end you'll have a header that slides up as the user scrolls, with a section that fades and scales away.

:::info Prerequisites
Make sure you have completed the [Installation](./installation) step and have all peer dependencies set up.
:::

## Step 1 — Wrap your screen with HeaderMotion

`HeaderMotion` is the root provider. Everything related to header motion — the header itself, the scrollable content, and the bridging — lives inside it.

```tsx
import HeaderMotion from 'react-native-header-motion';

export default function Screen() {
  return <HeaderMotion>{/* header and content will go here */}</HeaderMotion>;
}
```

## Step 2 — Add a scrollable

Replace your regular `ScrollView` with `HeaderMotion.ScrollView`. It works just like a normal `ScrollView` but participates in Header Motion's scroll tracking.

```tsx
export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.ScrollView>
        {/* your scrollable content */}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}
```

## Step 3 — Bridge the header into navigation

If your header is rendered by Expo Router or React Navigation, it lives outside the `HeaderMotion` subtree. You need to bridge the context across that boundary.

Use `HeaderMotion.Bridge` to capture the context and `HeaderMotion.NavigationBridge` to re-provide it in the navigation header:

```tsx
import HeaderMotion from 'react-native-header-motion';
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <CollapsibleHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>

      <HeaderMotion.ScrollView>
        {/* your scrollable content */}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}
```

:::tip
If your header lives **inside** the `HeaderMotion` subtree (not rendered by navigation), you can skip bridging entirely and place the header component directly as a child.
:::

## Step 4 — Build the header component

Now let's create `CollapsibleHeader`. It uses `useMotionProgress()` to get the `progress` shared value and `progressThreshold`, then drives animations with `useAnimatedStyle`.

The header can specify a **dynamic section** via `HeaderMotion.Header.Dynamic`. Its measured layout is used to derive the `progressThreshold` — the scroll offset that maps to `progress = 1`. Everything inside that section is up to you; the library only reads its size.

:::caution Performance
Avoid animating layout properties (width, height, padding, margin and similar) anywhere in the header. This is especially important because the layout of the header is what the library uses to calculate the `progressThreshold`. Whether you use `measureDynamicMode="mount"` or `"update"`, animating layout properties causes unnecessary layout passes that hurt performance. You can achieve pretty much the same visual results for many scenarios by just sticking to transforms and opacity changes. See [Reanimated's performance guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance) for more.
:::

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CollapsibleHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
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

  const titleStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    return {
      transform: [
        {
          translateY: interpolate(
            progress.get(),
            [0, 1],
            [0, threshold],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const dynamicStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        progress.get(),
        [0, 0.6],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(
            progress.get(),
            [0, 1],
            [1, 0.8],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <HeaderMotion.Header
      style={[styles.header, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={titleStyle}>
        <Text style={styles.title}>My App</Text>
      </Animated.View>

      <View style={styles.dynamicWrapper}>
        <HeaderMotion.Header.Dynamic style={dynamicStyle}>
          <View style={styles.dynamicContent}>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>
        </HeaderMotion.Header.Dynamic>
      </View>
    </HeaderMotion.Header>
  );
}
```

## Step 5 — Don't forget to add your own styling

This library does not style anything for you — the header will look however your styles say it should. Here's the stylesheet from the example above as a starting point:

```tsx
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
  dynamicWrapper: {
    overflow: 'hidden',
  },
  dynamicContent: {
    padding: 16,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
});
```

## Putting it all together

Here's the complete screen:

<details>
<summary>Full code</summary>

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <CollapsibleHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>

      <HeaderMotion.ScrollView>
        {Array.from({ length: 50 }, (_, i) => (
          <View key={i} style={styles.item}>
            <Text>Item {i + 1}</Text>
          </View>
        ))}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function CollapsibleHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
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

  const titleStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    return {
      transform: [
        {
          translateY: interpolate(
            progress.get(),
            [0, 1],
            [0, threshold],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const dynamicStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.6], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          progress.get(),
          [0, 1],
          [1, 0.8],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <HeaderMotion.Header
      style={[styles.header, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={titleStyle}>
        <Text style={styles.title}>My App</Text>
      </Animated.View>

      <View style={styles.dynamicWrapper}>
        <HeaderMotion.Header.Dynamic style={dynamicStyle}>
          <View style={styles.dynamicContent}>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>
        </HeaderMotion.Header.Dynamic>
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
  dynamicWrapper: {
    overflow: 'hidden',
  },
  dynamicContent: {
    padding: 16,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
```

</details>

## Summary

- `HeaderMotion` is the root provider that tracks everything
- `HeaderMotion.Header` measures the total header height and overlays it above content
- `HeaderMotion.Header.Dynamic` marks the section whose layout defines the `progressThreshold`
- `useMotionProgress()` gives you `progress` (`0` → `1`) and `progressThreshold` as shared values
- `HeaderMotion.Bridge` + `HeaderMotion.NavigationBridge` move context into navigation-rendered headers
- `HeaderMotion.ScrollView` is a drop-in replacement for `Animated.ScrollView`
  - There's also `HeaderMotion.FlatList`, and you can bring any scrollable you want via [`createHeaderMotionScrollable`](./guides/custom-scrollables)

## What's next?

Now that you have a working header, dive into the [Guides](./guides/dynamic-header-measurement) to learn about header measurement, advanced animations, multiple tabs, and more.
