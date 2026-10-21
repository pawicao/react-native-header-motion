---
sidebar_position: 3
title: Default scrollables
description: Built-in scrollable components that drive the header progress value.
---

# Default scrollables

Scrollable components are equally important as the header in Header Motion — they're what drives the `progress` value as the user scrolls. The library ships with two pre-wired scrollables that you can drop in with minimal setup.

## HeaderMotion.ScrollView

A drop-in replacement for React Native's `ScrollView`. It works exactly like you'd expect — same props, same behavior — but it's connected to Header Motion's scroll tracking under the hood.

```tsx
import HeaderMotion from 'react-native-header-motion';

export default function Screen() {
  return (
    <HeaderMotion>
      <MyHeader />
      <HeaderMotion.ScrollView>
        <Text>Your scrollable content goes here.</Text>
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}
```

## HeaderMotion.FlatList

Same story for `FlatList` — use `HeaderMotion.FlatList` wherever you'd use a regular `FlatList`:

```tsx
import HeaderMotion from 'react-native-header-motion';

export default function Screen() {
  return (
    <HeaderMotion>
      <MyHeader />
      <HeaderMotion.FlatList
        data={items}
        renderItem={({ item }) => <ItemCard item={item} />}
      />
    </HeaderMotion>
  );
}
```

No new API to learn for basic usage. If you know `ScrollView` and `FlatList`, you already know how to use these.

## Additional props

On top of the standard React Native props, Header Motion scrollables accept a few extra props:

| Prop                               | Type                                                      | Description                                                                                                         |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `scrollId`                         | `string`                                                  | Identifies this scrollable in multi-scroll setups (e.g., tabs). Defaults to an internal ID.                         |
| `headerOffsetStrategy`             | `'padding' \| 'margin' \| 'top' \| 'translate' \| 'none'` | How the content is offset to appear below the header. Defaults to `'padding'`.                                      |
| `ensureScrollableContentMinHeight` | `boolean`                                                 | When `true`, ensures the content is tall enough to scroll even if the actual content is short. Defaults to `false`. |
| `animatedRef`                      | `AnimatedRef`                                             | Pass your own Reanimated animated ref if you need external access to the scrollable.                                |

:::info
You can also pass standard scroll event handlers like `onScroll`, `onScrollBeginDrag`, etc. They'll be composed with Header Motion's internal handlers — your callbacks still fire normally.
:::

## Custom scrollables

For third-party scrollable components like [FlashList](https://shopify.github.io/flash-list/) or [LegendList](https://github.com/LegendApp/legend-list), use the `createHeaderMotionScrollable()` factory. For those two common integrations, you can also start from the exported `ScrollablePresets`. For more information, check the [Custom scrollables](./custom-scrollables) guide.

For even more control, you can manage the scroll integration yourself using `HeaderMotion.ScrollManager` or the `useScrollManager()` hook. See [Using ScrollManager](./using-scroll-manager) for details.

## What's next?

If your header is rendered by a navigation library (Expo Router, React Navigation), you'll need to bridge the context. Learn how in [Navigation bridging](./navigation-bridging).
