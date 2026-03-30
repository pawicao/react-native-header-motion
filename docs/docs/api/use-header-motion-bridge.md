---
sidebar_position: 12
title: useHeaderMotionBridge
---

# useHeaderMotionBridge

Returns the full internal HeaderMotion bridge value. This includes everything from `useMotionProgress()` plus measurement callbacks and scroll synchronization internals.

:::caution
Most app code should use `useMotionProgress()` instead. Only use this hook when you need direct access to the internal bridge value for advanced context-bridging scenarios.
:::

## Signature

```tsx
function useHeaderMotionBridge(): HeaderMotionBridgeValue;
```

## Returns

| Property                  | Type                               | Description                                           |
| ------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `progress`                | `SharedValue<number>`              | The collapse progress (`0` to `1`).                   |
| `progressThreshold`       | `SharedValue<number>`              | Collapse distance in pixels.                          |
| `measureTotalHeight`      | `(e: LayoutChangeEvent) => void`   | Callback wired to `HeaderMotion.Header`.              |
| `measureDynamic`          | `(e: LayoutChangeEvent) => void`   | Callback wired to `HeaderMotion.Header.Dynamic`.      |
| `headerPanMomentumOffset` | `SharedValue<number \| null>`      | Pan momentum tracking value.                          |
| `scrollValues`            | `SharedValue<ScrollValues>`        | Internal scroll state for all registered scrollables. |
| `activeScrollId`          | `SharedValue<string> \| undefined` | Currently active scroll ID.                           |
| `scrollToRef`             | `RefObject<ScrollTo \| null>`      | Imperative scroll function ref.                       |
| `originalHeaderHeight`    | `number`                           | Measured total header height.                         |

Must be called within a `HeaderMotion` or `HeaderMotion.NavigationBridge` subtree.
