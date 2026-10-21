---
sidebar_position: 15
title: Consumer scroll handlers
---

# Consumer scroll handlers

Header Motion internally uses an animated scroll handler to track scroll position and drive header animations. Your own scroll callbacks still work alongside it — you don't have to choose between the library's behavior and your own logic.

## Standard React Native callbacks

You can pass the familiar React Native scroll callbacks directly. These are bridged via `scheduleOnRN` so they fire on the JS thread:

```tsx
<HeaderMotion.ScrollView
  onScroll={(e) => console.log('offset:', e.nativeEvent.contentOffset.y)}
  onScrollBeginDrag={(e) => console.log('drag started')}
  onScrollEndDrag={(e) => console.log('drag ended')}
  onMomentumScrollBegin={(e) => console.log('momentum started')}
  onMomentumScrollEnd={(e) => console.log('momentum ended')}
>
  {/* content */}
</HeaderMotion.ScrollView>
```

## Reanimated animated scroll handler

If you need worklet-based scroll handling, pass a `useAnimatedScrollHandler` as the `onScroll` prop. Header Motion composes it with its internal handler via `useComposedEventHandler`, so both run on the UI thread:

```tsx
const onScroll = useAnimatedScrollHandler({
  onScroll: () => {
    'worklet';
    console.log('consumer onScroll worklet');
  },
});

<HeaderMotion.ScrollView onScroll={onScroll}>
  {/* content */}
</HeaderMotion.ScrollView>;
```

## Mixing approaches

Both approaches are compatible. Header Motion detects whether your `onScroll` is a standard callback or an animated handler and handles each accordingly. The library's internal scroll tracking continues to work regardless of which approach you use.

---

One more edge case to cover: learn how to handle screens where the content is too short to fully collapse the header in [Short scrollable content](./short-scrollable-content).
