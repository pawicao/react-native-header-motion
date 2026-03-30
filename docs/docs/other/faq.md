---
sidebar_position: 3
title: FAQ
description: Frequently asked questions about React Native Header Motion.
---

# FAQ

## Why doesn't the library ship a pre-built collapsible header?

Every app has different header designs — different layouts, animations, colors, and behaviors. Instead of trying to make a one-size-fits-all component with dozens of props, Header Motion gives you the measurement and progress plumbing. You build whatever header you want using standard Reanimated APIs.

## Do I need to use Expo Router?

No. The library works with any React Navigation setup. The bridging pattern (`Bridge` + `NavigationBridge`) works the same way whether you use Expo Router, a bare React Navigation stack, or any other navigator.

If your header lives inside the same component tree as `HeaderMotion` (not rendered by navigation), you don't need bridging at all.

## Why is `react-native-gesture-handler` a peer dependency?

Header panning is built on Gesture Handler's pan gesture. Even if you don't use the `pannable` prop, the library imports from `react-native-gesture-handler`. Most React Native projects already have it installed.

## Can I use this with FlashList / LegendList / other custom scrollables?

Yes. Use `createHeaderMotionScrollable()` to wrap any scrollable component. See the [Custom scrollables](../guides/custom-scrollables) guide.

## Does pull to refresh work?

Yes, with caveats. Android works well. iOS support is still being refined — `progressViewOffset` behavior is not fully deterministic on iOS. See the [Pull to refresh](../guides/pull-to-refresh) guide.

## How do I keep performance smooth?

Two things matter most:

1. **Avoid animating layout properties** (width, height, padding, margin) in the header. Stick to `transform` and `opacity`. This is especially important in `HeaderMotion.Header.Dynamic`, whose layout is used to derive the `progressThreshold`. Animating layout properties causes unnecessary layout passes and defeats the purpose of UI-thread animations. See [Reanimated's performance guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance).

2. **Use `scrollEventThrottle`** if scroll events are firing too frequently. Pass it directly to your Header Motion scrollable — for example, `scrollEventThrottle={16}` caps events at 60 fps. Higher values reduce event frequency further and lighten the workload.

## Can I use `progress` values outside `[0, 1]`?

Yes. Set `progressExtrapolation` on `HeaderMotion` to allow extended range. For example, `Extrapolation.EXTEND` on the left side lets `progress` go below `0` when the user overscrolls. See the [Overscroll](../guides/overscroll) guide.

## Can I only animate `HeaderMotion.Header.Dynamic`? What about the rest of the header?

No — you can animate anything in the header, including `HeaderMotion.Header` itself. `Header.Dynamic` is purely a measurement tool. Its job is to tell the library how many pixels of scroll should bring `progress` to `1`.

The rule of thumb: if a part of your header is supposed to visually disappear as the header collapses, wrap it in `Header.Dynamic`. That way its size is reflected in the `progressThreshold`, and the scrollable content offset is calculated correctly. But the animations themselves — opacity, scale, translateY, color — can live on any element anywhere in the header.
