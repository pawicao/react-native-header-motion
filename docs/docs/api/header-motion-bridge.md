---
sidebar_position: 6
title: HeaderMotion.Bridge
---

# HeaderMotion.Bridge

Captures the current HeaderMotion context and exposes it through a render function. Use it to forward context into a navigation-rendered header subtree.

## Usage

```tsx
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
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `(value: HeaderMotionBridgeValue) => ReactNode` | Render function that receives the bridged context value. |
