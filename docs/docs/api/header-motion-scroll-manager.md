---
sidebar_position: 8
title: HeaderMotion.ScrollManager
---

# HeaderMotion.ScrollManager

A render-prop component for managing custom scrollables. Prefer `createHeaderMotionScrollable()` for most integrations.

Use `ScrollManager` only when the factory approach doesn't give you enough flexibility.

## Usage

```tsx
<HeaderMotion.ScrollManager scrollId="custom">
  {(scrollableProps, { originalHeaderHeight, contentContainerMinHeight }) => (
    <Animated.ScrollView {...scrollableProps}>
      <Animated.View style={{ paddingTop: originalHeaderHeight }}>
        {/* content */}
      </Animated.View>
    </Animated.ScrollView>
  )}
</HeaderMotion.ScrollManager>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scrollId` | `string` | — | Unique identifier for multi-scroll setups. |
| `children` | `(scrollableProps, headerMotionContext) => ReactNode` | — | Render function receiving managed props and layout context. |
| `refreshControl` | `ReactElement` | — | Refresh control element. |
| `refreshing` | `boolean` | — | Whether refresh is active. |
| `onRefresh` | `() => void` | — | Refresh callback. |
| `progressViewOffset` | `number` | — | Custom offset for the refresh indicator. |
| `animatedRef` | `AnimatedRef` | — | External animated ref. |

### Render function arguments

**`scrollableProps`** contains:
- `onScroll` — managed scroll handler
- `onLayout` — layout handler for min-height calculations
- `refreshControl` — resolved refresh control (if applicable)
- `ref` — animated ref for the scrollable

**`headerMotionContext`** contains:
- `originalHeaderHeight: number` — measured header height for content offsetting
- `contentContainerMinHeight?: number` — computed min height (when `ensureScrollableContentMinHeight` is used)
