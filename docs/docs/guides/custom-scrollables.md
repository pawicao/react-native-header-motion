---
sidebar_position: 8
title: Custom scrollables
---

# Custom scrollables

Header Motion ships with `HeaderMotion.ScrollView` and `HeaderMotion.FlatList`, but you can integrate **any** scrollable component via the `createHeaderMotionScrollable()` factory. The resulting component works just like the built-in ones — it accepts all the original props plus Header Motion-specific ones like `scrollId` and `headerOffsetStrategy`.

## FlashList

```tsx
import { FlashList } from '@shopify/flash-list';
import { createHeaderMotionScrollable } from 'react-native-header-motion';

const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
});
```

Use it anywhere you'd use a regular `FlashList`:

```tsx
<HeaderMotionFlashList
  data={items}
  keyExtractor={(item) => `${item.index}`}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={80}
/>
```

## LegendList

LegendList exports a pre-animated variant, `AnimatedLegendList`, which is what you should pass to the factory. Set `isComponentAnimated: true` to skip the internal `Animated.createAnimatedComponent` wrapping:

```tsx
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { createHeaderMotionScrollable } from 'react-native-header-motion';

const HeaderMotionLegendList = createHeaderMotionScrollable(
  AnimatedLegendList,
  {
    displayName: 'HeaderMotionLegendList',
    isComponentAnimated: true,
  }
);
```

## Factory options

| Option                 | Type                                    | Default                              | Description                                                                                                                                                                    |
| ---------------------- | --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `displayName`          | `string`                                | Auto-derived from the component name | Sets the React `displayName` for dev tools.                                                                                                                                    |
| `isComponentAnimated`  | `boolean`                               | `false`                              | When `true`, the factory skips `Animated.createAnimatedComponent()`. Set this when the component is already animated.                                                          |
| `contentContainerMode` | `'children' \| 'renderScrollComponent'` | `'renderScrollComponent'`            | `'children'` wraps children in an inner `Animated.View` (ScrollView-like). `'renderScrollComponent'` injects a custom scroll component that wraps the content (FlatList-like). |

## What's next?

If `createHeaderMotionScrollable()` doesn't give you enough control, you can drop down to the render-prop or hook API in [Using Scroll Manager](./using-scroll-manager).
