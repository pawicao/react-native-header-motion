---
sidebar_position: 5
title: HeaderMotion.FlatList
---

# HeaderMotion.FlatList

A pre-wired `Animated.FlatList` that participates in Header Motion's scroll tracking and header offsetting.

Works identically to a standard `FlatList` with the same additional Header Motion props as `HeaderMotion.ScrollView`.

## Usage

```tsx
<HeaderMotion.FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
/>
```

## Props

Accepts all `Animated.FlatList` props, plus the same Header Motion-specific props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scrollId` | `string` | — | Unique identifier for multi-scroll setups. |
| `headerOffsetStrategy` | `'padding' \| 'margin' \| 'top' \| 'translate' \| 'none'` | `'padding'` | Controls how content is pushed below the header. |
| `ensureScrollableContentMinHeight` | `boolean` | `false` | Experimental. Adds minimum content height for short lists. |
| `animatedRef` | `AnimatedRef` | — | Your own animated ref for programmatic control. |
