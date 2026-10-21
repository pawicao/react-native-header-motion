---
sidebar_position: 10
title: Offset strategies
---

# Offset strategies

The header in Header Motion is absolutely positioned as an overlay above the scrollable content. This means the scrollable's content starts at the top of the screen and would be hidden behind the header unless we push it down. The `headerOffsetStrategy` prop controls **how** that push happens.

## Available strategies

### `'padding'` (default)

Adds `paddingTop` equal to the measured header height.

### `'margin'`

Uses `marginTop` instead.

### `'top'`

Sets `top` equal to the header height and adds matching `paddingBottom` compensation so the end of the content remains reachable. Useful when the content container needs a specific positioning context.

### `'translate'`

Applies `transform: [{ translateY }]` equal to the header height, with `paddingBottom` compensation. Since transforms don't affect layout flow, this can be helpful when you want to avoid shifting the content container's layout box.

### `'none'`

No automatic offset at all. You handle the spacing yourself via `contentContainerStyle`, manual padding, or any other technique. Use this when you need full control over how the content is positioned below the header.

## Usage

Pass the strategy to any Header Motion scrollable:

```tsx
<HeaderMotion.ScrollView headerOffsetStrategy="padding">
  {/* content */}
</HeaderMotion.ScrollView>
```

It works the same on `HeaderMotion.FlatList` and any component created with `createHeaderMotionScrollable()`.

## Combining with `contentContainerStyle`

You can pass `contentContainerStyle` alongside any strategy to override the automatic offset styles:

```tsx
<HeaderMotion.ScrollView
  headerOffsetStrategy="padding"
  contentContainerStyle={{ paddingHorizontal: 16 }}
>
  {/* content */}
</HeaderMotion.ScrollView>
```

:::info When to use `'none'`
If your layout needs something the built-in strategies don't cover — for example, an intermediate wrapper that already accounts for the header — set `headerOffsetStrategy="none"` and handle the offset manually. You can read `originalHeaderHeight` from `useScrollManager()` or the `ScrollManager` render prop if you need the measured value.
:::

## What's next?

See how to add pull-to-refresh support in [Pull to refresh](./pull-to-refresh).
