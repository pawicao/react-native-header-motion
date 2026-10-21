---
sidebar_position: 8
title: Custom scrollables
---

# Custom scrollables

Header Motion ships with `HeaderMotion.ScrollView` and `HeaderMotion.FlatList`, but you can integrate **any** scrollable component via the `createHeaderMotionScrollable()` factory. The resulting component works just like the built-in ones — it accepts all the original props plus Header Motion-specific ones like `scrollId` and `headerOffsetStrategy`.

For popular third-party lists, the library also exports `ScrollablePresets` with the recommended option combinations.

## FlashList

```tsx
import { FlashList } from '@shopify/flash-list';
import {
  createHeaderMotionScrollable,
  ScrollablePresets,
} from 'react-native-header-motion';

const HeaderMotionFlashList = createHeaderMotionScrollable(
  FlashList,
  ScrollablePresets.FlashList
);
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
import {
  createHeaderMotionScrollable,
  ScrollablePresets,
} from 'react-native-header-motion';

const HeaderMotionLegendList = createHeaderMotionScrollable(
  AnimatedLegendList,
  ScrollablePresets.AnimatedLegendList
);
```

## Presets vs manual options

`ScrollablePresets` is the easiest path when you are integrating supported third-party lists:

```tsx
import { ScrollablePresets } from 'react-native-header-motion';

ScrollablePresets.FlashList;
ScrollablePresets.AnimatedLegendList;
```

If you prefer to configure things manually, these are the equivalent options:

```tsx
const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
  contentContainerMode: 'renderScrollComponent',
  managedRefTarget: 'inner',
});
```

Use `managedRefTarget: 'inner'` when a third-party list exposes a controller ref on the outside but keeps the real native scroll view one layer deeper. FlashList and LegendList both fall into that category. React Native `FlatList` does not, so it should keep the default `'outer'`.

## Factory options

| Option                 | Type                                    | Default                              | Description                                                                                                                                                                    |
| ---------------------- | --------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `displayName`          | `string`                                | Auto-derived from the component name | Sets the React `displayName` for dev tools.                                                                                                                                    |
| `isComponentAnimated`  | `boolean`                               | `false`                              | When `true`, the factory skips `Animated.createAnimatedComponent()`. Set this when the component is already animated.                                                          |
| `contentContainerMode` | `'children' \| 'renderScrollComponent'` | `'renderScrollComponent'`            | `'children'` wraps children in an inner `Animated.View` (ScrollView-like). `'renderScrollComponent'` injects a custom scroll component that wraps the content (FlatList-like). |
| `managedRefTarget`     | `'outer' \| 'inner'`                    | `'outer'`                            | Controls which ref Header Motion uses for imperative sync. Only applies in `renderScrollComponent` mode. Use `'inner'` for list abstractions like FlashList and LegendList.    |

## What's next?

If `createHeaderMotionScrollable()` doesn't give you enough control, you can drop down to the render-prop or hook API in [Using Scroll Manager](./using-scroll-manager).
