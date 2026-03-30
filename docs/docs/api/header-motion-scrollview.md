---
sidebar_position: 4
title: HeaderMotion.ScrollView
---

# HeaderMotion.ScrollView

A pre-wired `Animated.ScrollView` that participates in Header Motion's scroll tracking and header offsetting.

It's a drop-in replacement for `Animated.ScrollView` with additional Header Motion capabilities.

## Usage

```tsx
<HeaderMotion.ScrollView>
  {/* scrollable content */}
</HeaderMotion.ScrollView>
```

## Props

Accepts all `Animated.ScrollView` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scrollId` | `string` | — | Unique identifier for multi-scroll setups where one header is shared across scrollables. |
| `headerOffsetStrategy` | `'padding' \| 'margin' \| 'top' \| 'translate' \| 'none'` | `'padding'` | Controls how content is pushed below the measured header. |
| `ensureScrollableContentMinHeight` | `boolean` | `false` | Experimental. Adds minimum content height so short content can still collapse the header. |
| `animatedRef` | `AnimatedRef` | — | Lets you reuse your own animated ref (from `useAnimatedRef()`) for programmatic scroll control. |

Standard scroll callbacks (`onScroll`, `onScrollBeginDrag`, `onScrollEndDrag`, `onMomentumScrollBegin`, `onMomentumScrollEnd`) work as expected alongside the internal handlers.

Refresh control props (`refreshing`, `onRefresh`, `refreshControl`, `progressViewOffset`) are also supported.
