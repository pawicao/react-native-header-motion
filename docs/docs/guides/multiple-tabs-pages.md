---
sidebar_position: 6
title: Multiple tabs and pages
---

# Multiple tabs and pages

One of the trickiest parts of collapsible headers is keeping the animation seamless when several scrollables share a single header. Think tab bars backed by a pager, or segmented pages that each have their own list. Header Motion handles this orchestration for you — no matter when or how the user switches pages, the header state stays consistent.

## Step 1 — Create active scroll ID state

`useActiveScrollId()` gives you a React state value **and** a Reanimated shared value that stay in sync. You need both because the React state drives your UI logic (e.g. highlighting the active tab), while the shared value lets Header Motion do its worklet-level scroll synchronization.

```tsx
import { useActiveScrollId } from 'react-native-header-motion';

const [activeScrollId, setActiveScrollId] = useActiveScrollId<string>('A');
```

The hook returns a tuple: `[{ state, sv }, setter]`.

- `state` — regular React state for rendering (e.g. conditionally styling the active tab)
- `sv` — a `SharedValue` that Header Motion reads on the UI thread
- `setter` — updates both values in lockstep

## Step 2 — Pass `activeScrollId.sv` to HeaderMotion

Tell Header Motion which scrollable is currently active by passing the shared value:

```tsx
<HeaderMotion activeScrollId={activeScrollId.sv}>{/* ... */}</HeaderMotion>
```

## Step 3 — Give each scrollable a unique `scrollId`

Every scrollable that shares the header needs its own `scrollId` string. Header Motion uses this to track independent scroll positions and reconcile them when the active ID changes.

```tsx
<HeaderMotion.ScrollView scrollId="A">{/* Page A */}</HeaderMotion.ScrollView>
<HeaderMotion.ScrollView scrollId="B">{/* Page B */}</HeaderMotion.ScrollView>
```

## Complete example with PagerView

Here is a full screen that combines a pager with two scrollable pages and a shared header:

```tsx
import HeaderMotion, { useActiveScrollId } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';

const indexToKey = new Map([
  [0, 'A'],
  [1, 'B'],
]);

const keyToIndex = new Map([
  ['A', 0],
  ['B', 1],
]);

export default function Screen() {
  const [activeScrollId, setActiveScrollId] = useActiveScrollId<string>('A');
  const pagerRef = useRef<PagerView>(null);

  return (
    <HeaderMotion activeScrollId={activeScrollId.sv}>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <CollapsibleHeader
                    activeTab={activeScrollId.state}
                    onTabChange={(key) =>
                      pagerRef.current?.setPage(keyToIndex.get(key)!)
                    }
                  />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) =>
          setActiveScrollId(indexToKey.get(e.nativeEvent.position)!)
        }
      >
        <View key="A">
          <HeaderMotion.ScrollView scrollId="A">
            {/* Page A content */}
          </HeaderMotion.ScrollView>
        </View>
        <View key="B">
          <HeaderMotion.ScrollView scrollId="B">
            {/* Page B content */}
          </HeaderMotion.ScrollView>
        </View>
      </PagerView>
    </HeaderMotion>
  );
}
```

When the user swipes between pages, `onPageSelected` calls the setter, which updates both the React state and the shared value. Header Motion picks up the change on the UI thread and smoothly reconciles the scroll positions — the header never jumps.

:::tip
For a more complete working implementation, see the [`collapsible-pager` example](https://github.com/pawicao/react-native-header-motion/blob/main/example/src/app/collapsible-pager.tsx) in the example app.
:::

## What's next?

Learn how to make the header itself draggable in [Header panning](./header-panning).
