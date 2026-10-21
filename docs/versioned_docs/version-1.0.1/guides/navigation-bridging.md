---
sidebar_position: 4
title: Navigation bridging
description: Share HeaderMotion context with headers rendered by React Navigation or Expo Router.
---

# Navigation bridging

When you use React Navigation or Expo Router, your navigation header is rendered **outside** the screen component tree. This means it can't access `HeaderMotion`'s React context directly — `useMotionProgress()` and other hooks won't work in the header component.

The same applies to header elements like `headerLeft`, `headerRight`, and `headerTitle` — they live in a different subtree and can't reach context providers on the screen.

## The solution: Bridge and NavigationBridge

Header Motion provides two components to solve this:

1. **`HeaderMotion.Bridge`** — a render prop that captures the full context value from inside the `HeaderMotion` subtree
2. **`HeaderMotion.NavigationBridge`** — re-provides that captured context in the navigation header subtree

Together, they carry the context across the tree boundary.

## Expo Router example

```tsx
import HeaderMotion from 'react-native-header-motion';
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <MyHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>

      <HeaderMotion.ScrollView>
        {/* your scrollable content */}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}
```

Inside `MyHeader`, `useMotionProgress()` works normally — it reads from the bridged context.

## React Navigation example

With plain React Navigation, use `navigation.setOptions`. You probably want to use an effect for that, a small helper component makes this clean — it receives `ctx` as a prop and applies the options whenever `ctx` changes:

```tsx
import { useEffect } from 'react';
import HeaderMotion from 'react-native-header-motion';
import type { HeaderMotionBridgeValue } from 'react-native-header-motion';
import type { NavigationProp } from '@react-navigation/native';

function BridgeEffect({
  ctx,
  navigation,
}: {
  ctx: HeaderMotionBridgeValue;
  navigation: NavigationProp<any>;
}) {
  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderMotion.NavigationBridge value={ctx}>
          <MyHeader />
        </HeaderMotion.NavigationBridge>
      ),
    });
  }, [ctx, navigation]);

  return null;
}

export default function Screen({ navigation }) {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(ctx) => <BridgeEffect ctx={ctx} navigation={navigation} />}
      </HeaderMotion.Bridge>

      <HeaderMotion.ScrollView>
        {/* your scrollable content */}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}
```

:::caution
`HeaderMotion.Bridge` expects a **function** as its child — it will throw if you pass a regular React element. The function receives the full bridge context value.
:::

## When bridging is not needed

If your header lives inside the `HeaderMotion` subtree — meaning it's rendered directly as a child rather than by navigation — bridging is unnecessary. Just place the header component inline:

```tsx
<HeaderMotion>
  <MyHeader />
  <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
</HeaderMotion>
```

This is common when you opt out of the navigation header entirely and render everything yourself.

## What's next?

Sometimes you want native navigation elements (back button, title) _and_ a custom animated header. Learn how to combine them in [Composing with native headers](./composing-with-native-headers).
