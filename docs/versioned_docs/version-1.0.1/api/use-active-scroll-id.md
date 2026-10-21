---
sidebar_position: 11
title: useActiveScrollId
---

# useActiveScrollId

Creates a synchronized pair of React state and Reanimated shared value for tracking the active scroll ID in multi-scroll setups.

## Signature

```tsx
function useActiveScrollId<T extends string>(
  initialId: T
): [ActiveScrollIdValues<T>, SetActiveScrollId<T>];
```

## Returns

A tuple of:

| Index | Type                               | Description                                                                                                                            |
| ----- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `[0]` | `{ state: T, sv: SharedValue<T> }` | `state` is for React UI logic (e.g. active tab highlight). `sv` is the shared value to pass to `HeaderMotion`'s `activeScrollId` prop. |
| `[1]` | `(newId: T) => void`               | Setter that updates both `state` and `sv` in sync.                                                                                     |

## Usage

```tsx
import { useActiveScrollId } from 'react-native-header-motion';

const [activeScrollId, setActiveScrollId] = useActiveScrollId<'A' | 'B'>('A');

// Pass to HeaderMotion
<HeaderMotion activeScrollId={activeScrollId.sv}>

// Use state for UI
const isTabAActive = activeScrollId.state === 'A';

// Update on page change
setActiveScrollId('B');
```
