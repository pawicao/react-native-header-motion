---
sidebar_position: 16
title: Short scrollable content (experimental)
---

# Short scrollable content

:::caution Experimental
This feature relies on extra layout measurement and the API may still change. The underlying approach involves measuring the viewport height and adding `progressThreshold` to compute the minimum height, which means there's an extra layout pass.
:::

When your scrollable has very little content — say, only three items — there may not be enough scroll distance to fully collapse the header. The user scrolls to the bottom but the header is still partially visible.

## Solution

The `ensureScrollableContentMinHeight` prop forces a minimum content height so the header can always be collapsed completely, regardless of how little content you have:

```tsx
<HeaderMotion.ScrollView ensureScrollableContentMinHeight>
  {/* even with only a few items, the header can fully collapse */}
</HeaderMotion.ScrollView>
```

## Why experimental

Getting the timing right between measurement and rendering is inherently tricky. We need to measure the viewport, calculate the required minimum height, and apply it — all without causing visible layout jumps. The current approach works, but we may refine the implementation in future versions.

## Availability

This prop is also available on scrollables created via `createHeaderMotionScrollable()` and on `ScrollManager`.

## What's next?

That covers all the guides! Check out the [API Reference](../api/header-motion) for detailed information on every component and hook.
