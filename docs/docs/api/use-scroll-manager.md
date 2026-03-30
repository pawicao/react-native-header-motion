---
sidebar_position: 13
title: useScrollManager
---

# useScrollManager

Hook-level API for managing a custom scrollable. This is the hook equivalent of `HeaderMotion.ScrollManager`.

Prefer `createHeaderMotionScrollable()` for most cases.

## Signature

```tsx
function useScrollManager(
  scrollId?: string,
  options?: UseScrollManagerOptions
): ScrollManagerConfig
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `scrollId` | `string` | Unique identifier for multi-scroll setups. |
| `options.animatedRef` | `AnimatedRef` | External animated ref. |
| `options.refreshControl` | `ReactElement` | Refresh control element. |
| `options.refreshing` | `boolean` | Whether refresh is active. |
| `options.onRefresh` | `() => void` | Refresh callback. |
| `options.progressViewOffset` | `number` | Custom refresh indicator offset. |
| `options.onScroll` | scroll handler | Consumer scroll handler (JS or worklet). |
| `options.onScrollBeginDrag` | callback | Drag begin handler. |
| `options.onScrollEndDrag` | callback | Drag end handler. |
| `options.onMomentumScrollBegin` | callback | Momentum begin handler. |
| `options.onMomentumScrollEnd` | callback | Momentum end handler. |
| `options.ensureScrollableContentMinHeight` | `boolean` | Experimental min-height behavior. |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `scrollableProps.onScroll` | handler | Managed scroll handler to spread onto the scrollable. |
| `scrollableProps.onLayout` | handler | Layout handler for min-height calculations. |
| `scrollableProps.refreshControl` | `ReactElement \| undefined` | Resolved refresh control. |
| `scrollableProps.ref` | `AnimatedRef` | Animated ref for the scrollable. |
| `headerMotionContext.originalHeaderHeight` | `number` | Header height for content offsetting. |
| `headerMotionContext.contentContainerMinHeight` | `number \| undefined` | Computed minimum content height. |

## Usage

```tsx
import { useScrollManager } from 'react-native-header-motion';
import Animated from 'react-native-reanimated';

function CustomScrollable() {
  const { scrollableProps, headerMotionContext } = useScrollManager('custom');

  return (
    <Animated.ScrollView {...scrollableProps}>
      <View style={{ paddingTop: headerMotionContext.originalHeaderHeight }}>
        {/* content */}
      </View>
    </Animated.ScrollView>
  );
}
```

Must be called within a `HeaderMotion` subtree.
