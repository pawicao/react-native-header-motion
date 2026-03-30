---
sidebar_position: 7
title: Header panning
---

# Header panning

When your header takes up a large portion of the screen, the scrollable area below it can feel cramped. Users naturally try to swipe on the header to scroll, but nothing happens — that's frustrating. Header panning fixes this by letting drags on the header surface drive the scroll, making the gesture feel continuous across the entire screen.

## Enabling panning

Add the `pannable` prop to `HeaderMotion.Header`:

```tsx
<HeaderMotion.Header pannable style={[styles.header, containerStyle]}>
  <HeaderMotion.Header.Dynamic style={dynamicStyle}>
    {/* collapsible content */}
  </HeaderMotion.Header.Dynamic>
</HeaderMotion.Header>
```

That's it. Dragging on the header now scrolls the active scrollable, and releasing with velocity triggers momentum decay just like a regular scroll fling.

## Customizing momentum

After the user lifts their finger, Header Motion runs a decay animation to simulate momentum. You can customize this with the `panDecayConfig` prop by passing a function that receives the gesture end event. The function runs inside a gesture end worklet, so it **must** be marked with the `'worklet'` directive:

```tsx
<HeaderMotion.Header
  pannable
  panDecayConfig={(event) => {
    'worklet';
    return {
      velocity: event.velocityY * 0.8,
      deceleration: 0.998,
    };
  }}
>
  {/* ... */}
</HeaderMotion.Header>
```

## Gesture handler root view

Header panning uses React Native Gesture Handler under the hood. If your header is rendered outside an existing `GestureHandlerRootView` (common with navigation-rendered headers), enable the `withGestureHandlerRootView` prop to wrap the pan gesture in its own root:

```tsx
<HeaderMotion.Header pannable withGestureHandlerRootView>
  {/* ... */}
</HeaderMotion.Header>
```

:::info Platform support
Header panning works on both platforms. On Android, it seems to be handled natively out of the box in tested implementations, so the `pannable` implementation targets iOS specifically. You don't need to do anything extra on Android.
:::

## What's next?

If you need to integrate a third-party scrollable like FlashList or LegendList, head to [Custom scrollables](./custom-scrollables).
