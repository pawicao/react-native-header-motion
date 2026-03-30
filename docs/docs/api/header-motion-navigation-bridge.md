---
sidebar_position: 7
title: HeaderMotion.NavigationBridge
---

# HeaderMotion.NavigationBridge

Re-provides a previously captured HeaderMotion context value in another subtree. Use together with `HeaderMotion.Bridge`.

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

Inside `MyHeader`, all Header Motion hooks work normally:

```tsx
function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  // ...
}
```

## Props

| Prop       | Type                      | Description                                                  |
| ---------- | ------------------------- | ------------------------------------------------------------ |
| `value`    | `HeaderMotionBridgeValue` | The context value captured by `HeaderMotion.Bridge`.         |
| `children` | `ReactNode`               | The subtree that should have access to HeaderMotion context. |
