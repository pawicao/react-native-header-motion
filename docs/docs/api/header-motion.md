---
sidebar_position: 1
title: HeaderMotion
---

# HeaderMotion

The root provider for a header-motion setup. It tracks header measurements, derives the shared `progress` value, and exposes the compound subcomponents.

## Usage

```tsx
import HeaderMotion from 'react-native-header-motion';

<HeaderMotion>
  {/* Header, Bridge, ScrollView, etc. */}
</HeaderMotion>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progressThreshold` | `number \| (measuredDynamic: number) => number` | `(h) => h` | Collapse distance in pixels. When a function, it receives the measured dynamic height. |
| `measureDynamic` | `(e: LayoutChangeEvent) => number` | height from layout | Controls what value is read from `Header.Dynamic`'s layout event. |
| `measureDynamicMode` | `'mount' \| 'update'` | `'mount'` | `'mount'` measures once. `'update'` re-measures on subsequent layouts. |
| `activeScrollId` | `SharedValue<string>` | — | Identifies which scrollable owns progress in multi-scroll setups. |
| `progressExtrapolation` | `ExtrapolationType` | `Extrapolation.CLAMP` | Controls how `progress` behaves outside `[0, 1]`. |
| `children` | `ReactNode` | — | Components participating in header motion. |

## Compound components

Access subcomponents as properties of the default export:

- `HeaderMotion.Header`
- `HeaderMotion.Header.Dynamic`
- `HeaderMotion.Bridge`
- `HeaderMotion.NavigationBridge`
- `HeaderMotion.ScrollView`
- `HeaderMotion.FlatList`
- `HeaderMotion.ScrollManager`
