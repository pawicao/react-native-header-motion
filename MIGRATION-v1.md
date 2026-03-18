# Migration to `v1.0.0-alpha.x`

This guide covers migration from `v0.3.x` to the `v1` alpha line.

> `v1.0.0-alpha.x` is intentionally unstable. More API adjustments (including breaking changes) can happen before stable `1.0.0`.

## High-level changes

- Motion values that used to be plain numbers are now exposed as `SharedValue<number>` in runtime APIs.
- `AnimatedHeaderBase` now requires `animatedHeaderBaseProps`.
- `react-native-gesture-handler` is now a peer dependency.
- Optional pannable headers were added via `enableHeaderPan`. To use header panning, you must use `AnimatedHeaderBase`.

## 1) Update peer dependencies

Make sure your app has:

- `react-native-gesture-handler` `>= 2.0.0`
- `react-native-reanimated` `>= 4.0.0`
- `react-native-worklets` `>= 0.4.0`

## 2) Treat `progressThreshold` as `SharedValue` in runtime usage

`HeaderMotion` still accepts:

- `progressThreshold={number}`
- `progressThreshold={(measuredDynamic) => number}`

But values returned from `useMotionProgress()` / `HeaderMotion.Header` changed from number to `SharedValue<number>`.

### Before (`v0.3.x`)

```tsx
const translateY = interpolate(
  progress.value,
  [0, 1],
  [0, -progressThreshold],
  Extrapolation.CLAMP
);
```

### After (`v1 alpha`)

```tsx
const threshold = progressThreshold.get(); // or progressThreshold.value
const translateY = interpolate(
  progress.get(), // or progress.value
  [0, 1],
  [0, -threshold],
  Extrapolation.CLAMP
);
```

## 3) Pass `animatedHeaderBaseProps` to `AnimatedHeaderBase`

`AnimatedHeaderBase` now expects `animatedHeaderBaseProps`, available from `useMotionProgress()` and `HeaderMotion.Header`.

### Before (`v0.3.x`)

```tsx
<AnimatedHeaderBase onLayout={measureTotalHeight} style={containerStyle} />
```

### After (`v1 alpha`)

```tsx
<AnimatedHeaderBase
  animatedHeaderBaseProps={animatedHeaderBaseProps}
  onLayout={measureTotalHeight}
  style={containerStyle}
/>
```

## 4) `originalHeaderHeight` in `useScrollManager` is now `SharedValue`

When using `HeaderMotion.ScrollManager` / `useScrollManager`, handle `originalHeaderHeight` as a shared value.

```tsx
<Animated.View
  style={[minHeightContentContainerStyle, { paddingTop: originalHeaderHeight }]}
>
  {/* content */}
</Animated.View>
```

## 5) Optional: enable pannable headers

Use the new prop only if you want direct pan gestures on the header:

```tsx
<HeaderMotion enableHeaderPan>{/* ... */}</HeaderMotion>
```

If your app does not already wrap the root with `GestureHandlerRootView`, you can set `withGestureHandlerRootView` on `AnimatedHeaderBase`. Using `AnimatedHeaderBase` is required for header panning to work.

## Migration checklist

- [ ] Add/verify peer dependencies (including gesture handler).
- [ ] Update runtime `progressThreshold` usage to `SharedValue` access.
- [ ] Pass `animatedHeaderBaseProps` into every `AnimatedHeaderBase`.
- [ ] Verify custom `ScrollManager` integrations against shared-value header height.
