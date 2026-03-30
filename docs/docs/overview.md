---
sidebar_position: 1
title: Overview
description: What React Native Header Motion does and how it works.
---

# Overview

![Header Motion banner — placeholder](https://placehold.co/800x300?text=Your+banner+here)

React Native Header Motion gives you the building blocks for scroll-driven animated headers in React Native. Instead of shipping a pre-built "collapsible header" component, it provides the plumbing that lets you build any header animation you can imagine.

The library is built on top of:

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — shared values, animated styles, and worklet-based scroll handling
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/) — pan gestures for header panning
- [React Native Worklets](https://docs.swmansion.com/react-native-worklets/docs/) — multi-thread orchestration work

:::tip
This library assumes you are comfortable with the basics of React Native Reanimated.

Then again, without basic knowledge of Reanimated you can't really make a cool React Native app anyway. 👀
:::

## What it does

Every app is different, and Header Motion is built with that in mind. Rather than making assumptions about your layout, it works with it dynamically — measuring what it needs at runtime, giving you a `progress` value to drive your animations however you like, and wiring everything up with your scrollables.

- **Measures header layout** — the total height and optionally the collapsible portion are measured automatically via `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic`
- **Derives a shared `progress` value** — a [number shared value](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value) that goes from `0` (expanded) to `1` (collapsed) as the user scrolls to a chosen offset
- **Keeps multiple scrollables in sync** — when one header is shared across tabs or pager pages, scroll positions are orchestrated seamlessly
- **Bridges state into navigation headers** — React Navigation and Expo Router render headers outside your component tree, so the library provides explicit bridging to make your life easy when controlling motion within in-navigation headers

## What it is not

This library is **not** trying to be:

- A fully styled header component
- A page layout framework
- A general-purpose animation abstraction

You wire things up with Header Motion, get the `progress` shared value, and then animate however you want using Reanimated.

## Mental model

Here is how a typical setup looks at a high level:

1. Wrap your screen content in `<HeaderMotion>` — this is the provider that tracks everything
2. Place `<HeaderMotion.Header>` with a `<HeaderMotion.Header.Dynamic>` inside to define what part of the header collapses
3. Use a Header Motion scrollable (`HeaderMotion.ScrollView`, `HeaderMotion.FlatList`, or a custom one) for your content
4. Read `progress` (from `0` to `1`) via the `useMotionProgress()` hook and drive any animation you like

```tsx
<HeaderMotion>
  <MyAnimatedHeader />
  <HeaderMotion.ScrollView>{/* your content */}</HeaderMotion.ScrollView>
</HeaderMotion>
```

Inside your header, you have full creative freedom:

```tsx
function MyAnimatedHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 1], [1, 0]),
  }));

  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic>
        <Animated.View style={style}>{/* fades out on scroll */}</Animated.View>
      </HeaderMotion.Header.Dynamic>
    </HeaderMotion.Header>
  );
}
```

## What's next?

Head over to [Installation](./installation) to add the library and its peer dependencies to your project.
