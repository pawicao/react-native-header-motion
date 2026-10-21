---
sidebar_position: 9
title: createHeaderMotionScrollable
---

# createHeaderMotionScrollable

Factory function for creating reusable Header Motion-aware wrappers around custom scrollable components.

This is the recommended way to integrate third-party scrollables like FlashList or LegendList.

For common integrations, the library also exports `ScrollablePresets` so you do not need to remember the recommended option combinations yourself.

## Signature

```tsx
function createHeaderMotionScrollable(
  Component: ScrollableComponent,
  options?: CreateHeaderMotionScrollableOptions
): HeaderMotionScrollableComponent;
```

## Options

| Option                 | Type                                    | Default                   | Description                                                                                                                                                                    |
| ---------------------- | --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `displayName`          | `string`                                | Auto-generated            | Component name shown in React DevTools.                                                                                                                                        |
| `isComponentAnimated`  | `boolean`                               | `false`                   | Set to `true` when the component is already animated (skips `Animated.createAnimatedComponent`).                                                                               |
| `contentContainerMode` | `'children' \| 'renderScrollComponent'` | `'renderScrollComponent'` | How Header Motion injects content offsetting. Use `'children'` for ScrollView-like, `'renderScrollComponent'` for FlatList-like.                                               |
| `managedRefTarget`     | `'outer' \| 'inner'`                    | `'outer'`                 | Which ref Header Motion uses for imperative sync. Only applies in `renderScrollComponent` mode. Use `'inner'` when the wrapped list's outer ref is not the actual scroll view. |

## Examples

### FlashList preset

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

### LegendList preset

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

### Manual options

```tsx
const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
  contentContainerMode: 'renderScrollComponent',
  managedRefTarget: 'inner',
});
```

Use `managedRefTarget: 'inner'` when the wrapped component exposes a controller ref on the outside but owns the actual native scroll view internally. FlashList and LegendList both need this. React Native `FlatList` does not, so the default `'outer'` behavior remains correct there.

The returned component accepts all the original component's props plus Header Motion-specific props (`scrollId`, `headerOffsetStrategy`, `ensureScrollableContentMinHeight`, `animatedRef`).
