---
sidebar_position: 2
title: HeaderMotion.Header
---

# HeaderMotion.Header

The main header container. It measures the total header height and can optionally make the header surface pannable.

By default, the header is absolutely positioned above content (`overlay: true`).

## Usage

```tsx
<HeaderMotion.Header style={[styles.header, animatedStyle]}>
  <HeaderMotion.Header.Dynamic>
    {/* collapsible section */}
  </HeaderMotion.Header.Dynamic>
  <View>{/* sticky section */}</View>
</HeaderMotion.Header>
```

## Props

Accepts all `Animated.View` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `overlay` | `boolean` | `true` | Absolutely positions the header above content. Disable only if you want the header in normal layout flow. |
| `pannable` | `boolean` | `false` | Allows dragging on the header surface to drive the scroll interaction. |
| `panDecayConfig` | `WithDecayConfig \| (event: HeaderPanDecayEvent) => WithDecayConfig` | — | Customizes momentum animation after a header pan ends. |
| `withGestureHandlerRootView` | `boolean` | `false` | Wraps the gesture subtree in `GestureHandlerRootView` when needed. |
| `asChild` | `boolean` | `false` | Injects the total-height measurement into a single child instead of rendering the default `Animated.View`. |
