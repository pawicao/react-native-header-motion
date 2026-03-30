---
sidebar_position: 9
title: createHeaderMotionScrollable
---

# createHeaderMotionScrollable

Factory function for creating reusable Header Motion-aware wrappers around custom scrollable components.

This is the recommended way to integrate third-party scrollables like FlashList or LegendList.

## Signature

```tsx
function createHeaderMotionScrollable(
  Component: ScrollableComponent,
  options?: CreateHeaderMotionScrollableOptions
): HeaderMotionScrollableComponent;
```

## Options

| Option                 | Type                                    | Default                   | Description                                                                                                                      |
| ---------------------- | --------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `displayName`          | `string`                                | Auto-generated            | Component name shown in React DevTools.                                                                                          |
| `isComponentAnimated`  | `boolean`                               | `false`                   | Set to `true` when the component is already animated (skips `Animated.createAnimatedComponent`).                                 |
| `contentContainerMode` | `'children' \| 'renderScrollComponent'` | `'renderScrollComponent'` | How Header Motion injects content offsetting. Use `'children'` for ScrollView-like, `'renderScrollComponent'` for FlatList-like. |

## Examples

### FlashList

```tsx
import { FlashList } from '@shopify/flash-list';
import { createHeaderMotionScrollable } from 'react-native-header-motion';

const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
});
```

### LegendList

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

The returned component accepts all the original component's props plus Header Motion-specific props (`scrollId`, `headerOffsetStrategy`, `ensureScrollableContentMinHeight`, `animatedRef`).
