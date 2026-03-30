---
sidebar_position: 9
title: Using Scroll Manager
---

# Using Scroll Manager

:::caution Advanced
This API is for cases where `createHeaderMotionScrollable()` doesn't give you enough control — for example, when a third-party scrollable needs highly custom composition or you need direct access to the layout values. Most apps won't need this.
:::

Header Motion offers two low-level approaches for wiring a custom scrollable: a render-prop component and a hook. Both give you the same data; pick whichever fits your component style.

## HeaderMotion.ScrollManager (render prop)

`ScrollManager` is a render-prop component that hands you the props to spread onto your scrollable, plus the layout context you need to offset the content below the header:

```tsx
<HeaderMotion.ScrollManager>
  {(scrollableProps, { originalHeaderHeight, contentContainerMinHeight }) => (
    <Animated.ScrollView {...scrollableProps}>
      <Animated.View
        style={{
          paddingTop: originalHeaderHeight,
          minHeight: contentContainerMinHeight,
        }}
      >
        {/* content */}
      </Animated.View>
    </Animated.ScrollView>
  )}
</HeaderMotion.ScrollManager>
```

The render function receives two arguments:

1. **`scrollableProps`** — contains `onScroll`, `onLayout`, `ref`, and an optional `refreshControl`. Spread these onto your scrollable.
2. **`headerMotionContext`** — contains `originalHeaderHeight` (the measured header height in pixels) and `contentContainerMinHeight` (set when `ensureScrollableContentMinHeight` is enabled).

## useScrollManager() hook

If you prefer hooks over render props, `useScrollManager()` returns the same data:

```tsx
import { useScrollManager } from 'react-native-header-motion';

function CustomScrollScreen() {
  const { scrollableProps, headerMotionContext } = useScrollManager();

  return (
    <Animated.ScrollView {...scrollableProps}>
      <Animated.View
        style={{
          paddingTop: headerMotionContext.originalHeaderHeight,
          minHeight: headerMotionContext.contentContainerMinHeight,
        }}
      >
        {/* content */}
      </Animated.View>
    </Animated.ScrollView>
  );
}
```

## Multi-scroll setups

Both the component and the hook accept a `scrollId` for multi-scroll scenarios. Pass the same ID you would use on a `HeaderMotion.ScrollView`:

```tsx
<HeaderMotion.ScrollManager scrollId="feed">
  {(scrollableProps, ctx) => (
    <Animated.FlatList {...scrollableProps} data={feedData} renderItem={renderItem} />
  )}
</HeaderMotion.ScrollManager>
```

```tsx
const { scrollableProps } = useScrollManager('feed');
```

## Refresh props

Both approaches accept the same refresh-related props as the built-in scrollables: `refreshControl`, `refreshing`, `onRefresh`, and `progressViewOffset`. Header Motion adjusts the refresh indicator offset to account for the header height automatically.

## Prefer the factory first

In almost every case, `createHeaderMotionScrollable()` is the better choice — it handles content container offsetting, layout composition, and prop forwarding for you. Reach for `ScrollManager` or `useScrollManager()` only when you need to compose things in a way the factory can't express.

## What's next?

Learn how the scrollable content is pushed below the header in [Offset strategies](./offset-strategies).
