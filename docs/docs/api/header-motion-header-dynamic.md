---
sidebar_position: 3
title: HeaderMotion.Header.Dynamic
---

# HeaderMotion.Header.Dynamic

Marks the part of the header whose layout defines the collapse distance (`progressThreshold`).

Wrap the section that visually disappears during collapse with this component.

## Usage

```tsx
<HeaderMotion.Header style={headerStyle}>
  <HeaderMotion.Header.Dynamic style={dynamicStyle}>
    {/* This section's height defines progressThreshold */}
  </HeaderMotion.Header.Dynamic>
  <View>{/* Sticky section */}</View>
</HeaderMotion.Header>
```

## Props

Accepts all `Animated.View` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Injects the dynamic measurement into a single child element instead of rendering the default `Animated.View`. |
