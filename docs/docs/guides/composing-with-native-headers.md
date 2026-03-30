---
sidebar_position: 5
title: Composing with native headers
description: Combine native navigation elements with custom animated headers.
---

# Composing with native headers

Replacing the navigation header entirely with a custom one means you lose native elements you might want to keep — the back button, the title, `headerRight` actions, and so on. Recreating those from scratch is possible (using `@react-navigation/elements`, for instance), but it's tedious and easy to get wrong.

A better approach is to **compose** the native header with your animated header so you get the best of both worlds.

## The idea: transparent overlay

The trick is simple:

1. Set the navigation header to `headerTransparent: true` so it floats over the content without taking up layout space
2. Place your `HeaderMotion.Header` inline on the screen — it renders *underneath* the transparent native header
3. The native elements (back button, title, `headerRight`, `headerLeft`) appear on top, while your custom animated header does its thing behind them

Because the header is inline rather than in a separate navigation subtree, there's no need for bridging — `useMotionProgress()` works directly inside it.

## Example

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NATIVE_HEADER_HEIGHT = 48;

export default function Screen() {
  return (
    <HeaderMotion>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitleStyle: { color: 'white' },
          title: 'My Screen',
          headerRight: () => <MyHeaderAction />,
        }}
      />
      <CollapsibleHeader />
      <HeaderMotion.ScrollView>
        {/* your scrollable content */}
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
        { translateY: interpolate(progress.get(), [0, 1], [0, -threshold], Extrapolation.CLAMP) },
      ],
    };
  });

  const dynamicStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.6], [1, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.get(), [0, 1], [1, 0.8], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <HeaderMotion.Header
      style={[
        styles.header,
        { paddingTop: insets.top + NATIVE_HEADER_HEIGHT },
        containerStyle,
      ]}
    >
      <View style={styles.dynamicWrapper}>
        <HeaderMotion.Header.Dynamic style={dynamicStyle}>
          <View style={styles.dynamicContent}>
            {/* your collapsible content */}
          </View>
        </HeaderMotion.Header.Dynamic>
      </View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#304077',
    zIndex: 1,
  },
  dynamicWrapper: {
    overflow: 'hidden',
  },
  dynamicContent: {
    padding: 16,
  },
});
```

:::info
When using `headerTransparent`, the native header no longer pushes your content down. You'll need to add `paddingTop` to your custom header to account for the safe area insets **plus** the native header height. The native header height can be obtained from `useHeaderHeight()` (from `@react-navigation/elements`) or estimated as a constant.
:::

:::caution
Setting `zIndex: 1` on `HeaderMotion.Header` is important here. Since the header and the scrollable are siblings in the same layout (unlike the native header which renders in its own layer), you need the z-index to ensure the header draws on top of the scrollable content as they overlap during animation.
:::

## Why this works well

- **Native back button** — you get the platform-correct back gesture and button for free
- **Native title** — the title animates with the standard navigation transitions
- **`headerRight` / `headerLeft`** — any actions you configure through navigation options just work
- **Custom animations** — your `HeaderMotion.Header` still slides, fades, and scales as you've defined

This is especially useful for screens that need to feel "native" (with proper navigation transitions and gestures) while still having a rich, animated header area.

## What's next?

Learn how to share a single header across multiple tabs or pager pages in [Multiple tabs/pages](./multiple-tabs-pages).
