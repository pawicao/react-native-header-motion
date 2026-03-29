# Migration to `v1`

This guide covers migration from `v0.3.x` to the current `v1` API.

The API change is quite substantial, but in practice the migration is usually straightforward and the new shape provides a much better developer experience.

If you are not migrating yet and need the old docs, use the `v0` README:
[README on branch `v0`](https://github.com/pawicao/react-native-header-motion/blob/v0/README.md)

## What changed at a high level

The biggest conceptual shift is this:

- `v0.3.x` used a prop-passing header API
- `v1` uses a context-first header API

In practice that means:

- `HeaderMotion.Header` is no longer a render-prop bridge
- `AnimatedHeaderBase` / `HeaderBase` are gone from the public API
- `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic` now own measurement wiring
- navigation headers now use `Bridge` + `NavigationBridge`
- `useMotionProgress()` is intentionally narrower

## Upgrade checklist

- [ ] Add `react-native-gesture-handler` as a peer in your app if you do not already have it
- [ ] Replace render-prop `HeaderMotion.Header` with `HeaderMotion.Bridge` + `HeaderMotion.NavigationBridge` if you place your animated headers in the navigation context.
- [ ] Replace `AnimatedHeaderBase` / `HeaderBase` with `HeaderMotion.Header`
- [ ] Replace manual `measureDynamic` wiring with `HeaderMotion.Header.Dynamic`
- [ ] Remove usage of `WithCollapsibleHeaderProps` / `WithCollapsiblePagedHeaderProps` and use the `useMotionProgress` in your header components directly to get progress and progress threshold.
- [ ] Update `useMotionProgress()` usage to read `progressThreshold` as a `SharedValue`
- [ ] Review custom scrollable integrations if you were using `ScrollManager` / `useScrollManager`

## 1. Peer dependencies changed

`v1` expects your app to provide:

- `react-native-gesture-handler >= 2.0.0`
- `react-native-reanimated >= 4.0.0`
- `react-native-worklets >= 0.4.0`

`react-native-gesture-handler` is now part of the peer surface because header panning is built on it.

## 2. `HeaderMotion.Header` is no longer a render prop

### Before (`v0.3.x`)

`HeaderMotion.Header` was the navigation bridge:

```tsx
<HeaderMotion.Header>
  {(headerProps) => (
    <Stack.Screen
      options={{
        header: () => <MyHeader {...headerProps} />,
      }}
    />
  )}
</HeaderMotion.Header>
```

### After (`v1`)

You now bridge in two explicit steps:

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

Inside `MyHeader`, call `useMotionProgress()` normally.

Why this changed:

- `HeaderMotion.Header` is now reserved for the actual header container primitive
- the bridge behavior is now explicit and easier to reason about

## 3. `AnimatedHeaderBase` and `HeaderBase` were removed

### Removed exports

- `AnimatedHeaderBase`
- `HeaderBase`

### Before (`v0.3.x`)

```tsx
function MyHeader({
  progress,
  progressThreshold,
  measureTotalHeight,
  measureDynamic,
}: WithCollapsibleHeaderProps) {
  return (
    <AnimatedHeaderBase onLayout={measureTotalHeight}>
      <Animated.View onLayout={measureDynamic}>
        {/* collapsible part */}
      </Animated.View>
      <View>{/* sticky part */}</View>
    </AnimatedHeaderBase>
  );
}
```

### After (`v1`)

```tsx
function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic>
        {/* collapsible part */}
      </HeaderMotion.Header.Dynamic>
      <View>{/* sticky part */}</View>
    </HeaderMotion.Header>
  );
}
```

What changed:

- total-height measurement is wired by `HeaderMotion.Header`
- dynamic measurement is wired by `HeaderMotion.Header.Dynamic`
- you no longer manually attach `measureTotalHeight` / `measureDynamic` in the common case

## 4. `useMotionProgress()` is narrower

### Before (`v0.3.x`)

`useMotionProgress()` returned:

- `progress`
- `progressThreshold`
- `measureTotalHeight`
- `measureDynamic`

### After (`v1`)

`useMotionProgress()` returns only:

- `progress`
- `progressThreshold`

If you need the full bridged value for advanced context-bridging use cases, use `useHeaderMotionBridge()`.

Why this changed:

- the common animation API should expose only what header components usually need
- measurement wiring now lives in `HeaderMotion.Header` / `HeaderMotion.Header.Dynamic`

## 5. `progressThreshold` is now a `SharedValue` at runtime

At the provider level, `progressThreshold` is still configured the same way:

- a number
- or `(measuredDynamic) => number`

But once you read it from `useMotionProgress()`, it is a `SharedValue<number>`.

### Before (`v0.3.x`)

```tsx
const translateY = interpolate(
  progress.value,
  [0, 1],
  [0, -progressThreshold],
  Extrapolation.CLAMP
);
```

### After (`v1`)

```tsx
const threshold = progressThreshold.get();

const translateY = interpolate(
  progress.get(),
  [0, 1],
  [0, -threshold],
  Extrapolation.CLAMP
);
```

## 6. Motion-prop helper types were removed

### Removed exports

- `WithCollapsibleHeaderProps`
- `WithCollapsiblePagedHeaderProps`

These existed because the old API pushed motion data into headers as props.

In v1, headers usually read from context with:

- `useMotionProgress()`
- `useHeaderMotionBridge()` only when explicitly bridging context

So the old prop helper types are no longer the right abstraction.

## 7. `HeaderMotion.Header.Dynamic` replaces manual dynamic measurement

If you previously attached `measureDynamic` manually to some inner element, the best migration is to wrap that part in `HeaderMotion.Header.Dynamic`.

### Before

```tsx
<Animated.View onLayout={measureDynamic}>{/* dynamic content */}</Animated.View>
```

### After

```tsx
<HeaderMotion.Header.Dynamic>
  {/* dynamic content */}
</HeaderMotion.Header.Dynamic>
```

You can still use `asChild` when you need to preserve a specific element.

## 8. Navigation headers should use `useMotionProgress()` again after bridging

Under the old API, the usual flow was:

- bridge through `HeaderMotion.Header`
- receive motion props directly in the navigation header

Under v1, the usual flow is:

- bridge with `HeaderMotion.Bridge`
- re-provide with `HeaderMotion.NavigationBridge`
- call `useMotionProgress()` inside the navigation header component

That keeps the navigation header code looking the same as an inline header.

## 9. Custom scrollable integrations changed

If you were using `HeaderMotion.ScrollManager` or `useScrollManager()` before, review these changes:

- prefer `createHeaderMotionScrollable()` for most reusable custom integrations
- `useScrollManager()` now returns:
  - `scrollableProps`
  - `headerMotionContext`
- `headerMotionContext` now exposes:
  - `originalHeaderHeight`
  - `contentContainerMinHeight`

### Before (`v0.3.x`)

The old hook exposed `minHeightContentContainerStyle`, which you could pass directly into styles.

### After (`v1`)

You now get the plain value `contentContainerMinHeight` instead.

So instead of:

```tsx
<View style={headerMotionContext.minHeightContentContainerStyle} />
```

you should do:

```tsx
<View
  style={
    headerMotionContext.contentContainerMinHeight !== undefined
      ? { minHeight: headerMotionContext.contentContainerMinHeight }
      : undefined
  }
/>
```

You normally won't be doing that manually, since it is under the hood in exported scrollables and ones created by `createHeaderMotionScrollable`.

Also note:

- `ensureScrollableContentMinHeight` is now the explicit opt-in for that behavior
- this feature is still experimental

## 10. Recommended migration path

For most apps, the best migration is:

1. Replace old navigation render-prop usage with `Bridge` + `NavigationBridge`
2. Move header measurement wiring into `Header` and `Header.Dynamic`
3. Remove old collapsible-prop helper types and rely on `useMotionProgress()` to get progress and progress threshold.
4. Update animation code to read `progressThreshold` from a shared value

## Side-by-side migration example

### Before (`v0.3.x`)

```tsx
import HeaderMotion, {
  AnimatedHeaderBase,
  type WithCollapsibleHeaderProps,
} from 'react-native-header-motion';

function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Header>
        {(headerProps) => (
          <Stack.Screen
            options={{
              header: () => <MyHeader {...headerProps} />,
            }}
          />
        )}
      </HeaderMotion.Header>

      <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function MyHeader({
  progress,
  progressThreshold,
  measureTotalHeight,
  measureDynamic,
}: WithCollapsibleHeaderProps) {
  return (
    <AnimatedHeaderBase onLayout={measureTotalHeight}>
      <Animated.View onLayout={measureDynamic} />
    </AnimatedHeaderBase>
  );
}
```

### After (`v1`)

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';

function Screen() {
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

      <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic />
    </HeaderMotion.Header>
  );
}
```
