# React Native Header Motion

High-level APIs for **orchestrating header motion** driven by scroll — built on top of [**React Native Reanimated**](https://docs.swmansion.com/react-native-reanimated/).

This library is **100% a wrapper around Reanimated**. All the credit for the underlying animation engine, worklets, and primitives goes to **Reanimated** (and `react-native-worklets`). This package focuses on a specific use case: **header motion + scroll orchestration** (including multi-scroll/tab scenarios).

<div align="center">
<img src="https://github.com/user-attachments/assets/b673349a-f26a-4cc8-bfe1-60d77deb4390" width="70%" />
</div>

## v1 alpha status

`v1.0.0-alpha.x` is pre-release quality.

- Expect additional API changes (including breaking ones) before stable `1.0.0`.
- If you are upgrading from `0.3.x`, use the migration doc: [MIGRATION-v1.md](./MIGRATION-v1.md).

## What changed since `v0.3.0`

- **Performance-focused internals:** motion threshold + header height now flow through `SharedValue`s to reduce JS-side churn.
- **Pannable header support:** new `enableHeaderPan` on `HeaderMotion` and required `animatedHeaderBaseProps` on `AnimatedHeaderBase`.
- **Ecosystem update:** example app moved to Expo 55 + Reanimated 4.2; `react-native-gesture-handler` is now a peer dependency.

## What this is (and isn’t)

**✅ This is**

- A small set of components + hooks that expose a single `progress` shared value and a few measurement helpers.
- A scroll orchestration layer that can keep multiple scrollables in sync (e.g. tabs + pager).

**❌ This is NOT**

- An out-of-the-box “collapsible header” component with a baked-in look.

You build any header motion you want by animating based on `progress`.

## Requirements (peer dependencies)

You must have these installed in your app:

- `react-native-gesture-handler` **>= 2.0.0**
- `react-native-reanimated` **>= 4.0.0**
- `react-native-worklets` **>= 0.4.0**

This package declares them as peer dependencies, so your app owns those versions. Remember to install a version of Worklets compatible with your version of Reanimated.

## Installation

```bash
npm i react-native-header-motion
```

or

```bash
yarn add react-native-header-motion
```

### Reanimated setup

Follow the official Reanimated [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation) for your environment (Expo / bare RN).

## Mental model

There are three key concepts:

### 1) `progress` (SharedValue)

`progress` is a Reanimated `SharedValue<number>` that represents the normalized progress of your header animation.

- `0` → animation start (initial state)
- `1` → animation end (final state)

### 2) `progressThreshold` (prop vs runtime value)

`progressThreshold` is the distance needed for `progress` to move from `0 → 1`.

As a `HeaderMotion` prop, you can provide:

- a number, or
- a function `(measuredDynamic) => threshold`

If you provide a function, it uses the value measured by `measureDynamic`.

When you read `progressThreshold` from `useMotionProgress()` / `HeaderMotion.Header`, it is a `SharedValue<number>`.
Read it inside worklets via `progressThreshold.get()` (or `progressThreshold.value`).

### 3) Measurement functions

The library gives you two measurement callbacks that you pass to your header layout:

- `measureTotalHeight` – attach to the _outer_ header container to measure the total header height. Scrollables use this to offset content so it starts below the header.
- `measureDynamic` – attach to the part of the header that determines the threshold (often the animated/dynamic portion).

## Why `HeaderMotion.Header` exists

When you pass a `header` component to React Navigation / Expo Router, that header is rendered by the navigator in a different part of the React tree.

Because of that, the navigation header **cannot read the `HeaderMotion` context**, so calling `useMotionProgress()` inside that header would throw.

`HeaderMotion.Header` solves this by acting as a **bridge**: it runs inside the provider, reads context, and passes the values to your navigation header via a render function.

## Why `HeaderBase` / `AnimatedHeaderBase` uses absolute positioning

Navigation headers are special:

- Even with `headerTransparent: true`, the navigator can still reserve layout space for the header container.
- If you animate with translations without absolute positioning, you can end up with:
  - content below becoming unclickable (an invisible parent header still sits on top), or
  - content hidden under the header container.

`HeaderBase` and `AnimatedHeaderBase` are **absolutely positioned** to avoid those layout traps, which is especially important when you use transforms/translations.

## When to use components vs hooks

You can use either style; pick based on your integration needs:

- Prefer **components** when you want a “batteries included” wiring:

  - `HeaderMotion.ScrollView` / `HeaderMotion.FlatList` for common scrollables
  - `HeaderMotion.ScrollManager` for custom scrollables via render-props

- Prefer **hooks** when you want to build your own wrappers:
  - `useScrollManager()` (same engine as `HeaderMotion.ScrollManager`, but hook-based)
  - `useMotionProgress()` when your header is inside the provider tree

Also:

- Use `HeaderMotion.Header` when your header is rendered by navigation.
- Use `useMotionProgress` when your header is rendered inside the same tree as `HeaderMotion`.

## Examples

### Example app

Examples live in the example app: `example/`. They demonstrate a few cases, from simple animations, to scroll orchestration and persisted header animation state between different tabs (e.g. with `react-native-pager-view`).

Those examples use Expo Router as the navigation library, but it should be fairly simple to do the same with plain React Navigation.

### Expo Router

This is the core pattern used in the example app (`example/src/app/simple.tsx`).

```tsx
import HeaderMotion, {
  AnimatedHeaderBase,
  type WithCollapsibleHeaderProps,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function Screen() {
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

      <HeaderMotion.ScrollView>
        {/* your scrollable content */}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function MyHeader({
  progress,
  measureTotalHeight,
  measureDynamic,
  progressThreshold,
  animatedHeaderBaseProps,
}: WithCollapsibleHeaderProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  return (
    <AnimatedHeaderBase
      animatedHeaderBaseProps={animatedHeaderBaseProps}
      onLayout={measureTotalHeight}
      style={[{ paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View onLayout={measureDynamic}>
        {/* “dynamic” part of the header */}
      </Animated.View>

      <View>{/* "regular" part of the header */}</View>
    </AnimatedHeaderBase>
  );
}
```

### React Navigation

In React Navigation you typically configure headers via `navigation.setOptions()`.

Important: the header itself can’t call `useMotionProgress()`, so we still use `HeaderMotion.Header` as a bridge.

```tsx
import React from 'react';
import HeaderMotion, {
  AnimatedHeaderBase,
  type WithCollapsibleHeaderProps,
} from 'react-native-header-motion';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export function MyScreen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Header>
        {(headerProps) => (
          <NavigationHeaderInstaller headerProps={headerProps} />
        )}
      </HeaderMotion.Header>
      <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function NavigationHeaderInstaller({
  headerProps,
}: {
  headerProps: WithCollapsibleHeaderProps;
}) {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <MyHeader {...headerProps} />,
    });
  }, [navigation, headerProps]);

  return null;
}

function MyHeader({
  progress,
  measureTotalHeight,
  measureDynamic,
  progressThreshold,
  animatedHeaderBaseProps,
}: WithCollapsibleHeaderProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  return (
    <AnimatedHeaderBase
      animatedHeaderBaseProps={animatedHeaderBaseProps}
      onLayout={measureTotalHeight}
      style={[{ paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View onLayout={measureDynamic}>
        {/* “dynamic” part of the header */}
      </Animated.View>

      <View>{/* "regular" part of the header */}</View>
    </AnimatedHeaderBase>
  );
}
```

### Tabs / pager: synchronizing multiple scrollables

If you have multiple scrollables (e.g. pages in `react-native-pager-view`), you can keep a single header progress by:

1. Creating a shared “active scroll id” using `useActiveScrollId()`
2. Passing `activeScrollId.sv` to `<HeaderMotion activeScrollId={...} />`
3. Rendering each page scrollable with a unique `scrollId`

The example app shows this pattern in `example/src/app/collapsible-pager.tsx` using `HeaderMotion.ScrollManager`.

### Keeping the native header (back button/title) + custom animated header below

Sometimes you want to keep the native navigation header for back buttons + title, but still animate a custom header section below it.

In that case:

- set `headerTransparent: true`
- do **not** provide a custom `header` component
- render your animated header content _inside the screen_ under the native header

Sketch:

```tsx
import HeaderMotion, {
  AnimatedHeaderBase,
  useMotionProgress,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { View } from 'react-native';

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTransparent: true }} />
      <HeaderMotion>
        <InlineAnimatedHeader />
        <HeaderMotion.ScrollView>
          {/* rest of content */}
        </HeaderMotion.ScrollView>
      </HeaderMotion>
    </>
  );
}

function InlineAnimatedHeader() {
  const {
    progress,
    measureTotalHeight,
    measureDynamic,
    progressThreshold,
    animatedHeaderBaseProps,
  } = useMotionProgress();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  return (
    <AnimatedHeaderBase
      animatedHeaderBaseProps={animatedHeaderBaseProps}
      onLayout={measureTotalHeight}
      style={containerStyle}
    >
      <Animated.View onLayout={measureDynamic}>
        {/* custom animated header content below the native header */}
      </Animated.View>
      <View>{/* sticky part */}</View>
    </AnimatedHeaderBase>
  );
}
```

## API

The package exports a default compound component plus hooks, types, and a couple base components.

### `HeaderMotion` (default export)

`HeaderMotion` is a compound component:

- `HeaderMotion` (provider)
- `HeaderMotion.Header` (bridge for navigation headers)
- `HeaderMotion.ScrollView` (pre-wired Animated.ScrollView)
- `HeaderMotion.FlatList` (pre-wired Animated.FlatList)
- `HeaderMotion.ScrollManager` (render-prop API for custom scrollables)

#### Props

- `progressThreshold?: number | (measuredDynamic: number) => number`
  - Defines how many pixels correspond to `progress` going from `0` to `1`.
  - If you pass a function, it uses the value measured from `measureDynamic`.
- `measureDynamic?: (e) => number`
  - What value to read from the `onLayout` event (defaults to `height`).
- `measureDynamicMode?: 'mount' | 'update'`
  - Whether `measureDynamic` updates only once or on every layout recalculation.
- `activeScrollId?: SharedValue<string>`
  - Enables multi-scroll orchestration (tabs/pager).
- `progressExtrapolation?: ExtrapolationType`
  - Controls how progress behaves outside the threshold range (useful for overscroll).
- `enableHeaderPan?: boolean`
  - Enables direct pan gestures on `AnimatedHeaderBase` (`false` by default).

#### `HeaderMotion.Header`

Render-prop component that passes motion progress props to a header you render via navigation.

```tsx
<HeaderMotion.Header>
	{(headerProps) => /* pass headerProps into navigation header */}
</HeaderMotion.Header>
```

Use this instead of `useMotionProgress()` when your header is rendered by React Navigation / Expo Router.

#### `HeaderMotion.ScrollView`

Animated ScrollView wired with:

- `onScroll` handler
- `ref`
- automatic content offset based on measured header height

Supports:

- `scrollId?: string` for multi-scroll scenarios
- `headerOffsetStrategy?: 'padding' | 'margin' | 'top' | 'translate' | 'none'`
- `ensureScrollableContentMinHeight?: boolean`

`padding` is the default and recommended option. `top` and `translate` also add bottom compensation internally so the end of the content remains reachable.

#### `HeaderMotion.FlatList`

Animated FlatList wired similarly to the ScrollView.

Supports:

- `scrollId?: string` for multi-scroll scenarios
- `headerOffsetStrategy?: 'padding' | 'margin' | 'top' | 'translate' | 'none'`
- `ensureScrollableContentMinHeight?: boolean`

#### `HeaderMotion.ScrollManager`

Render-prop API for custom scrollables (pager pages, 3rd party lists, etc.).

If you use `HeaderMotion.ScrollManager` directly for custom integrations, pass refresh-related props to `ScrollManager` (instead of your inner scrollable):

- `refreshControl`
- `refreshing`
- `onRefresh`
- optional `progressViewOffset` if you want to force your offset.

This is required, as the positioning of scrollables is affecting Refresh Control and has to be coupled with the header heights.

```tsx
<HeaderMotion.ScrollManager scrollId="A">
  {(
    scrollableProps,
    { originalHeaderHeight, minHeightContentContainerStyle }
  ) => (
    <Animated.ScrollView {...scrollableProps}>
      <Animated.View
        style={[
          minHeightContentContainerStyle,
          { paddingTop: originalHeaderHeight },
        ]}
      >
        {/* content */}
      </Animated.View>
    </Animated.ScrollView>
  )}
</HeaderMotion.ScrollManager>
```

Refresh example with explicit props on `ScrollManager`:

```tsx
<HeaderMotion.ScrollManager
  scrollId="A"
  refreshing={refreshing}
  onRefresh={onRefresh}
>
  {(
    { onScroll, refreshControl: managedRefreshControl, ...scrollableProps },
    { originalHeaderHeight, minHeightContentContainerStyle }
  ) => (
    <Animated.ScrollView
      {...scrollableProps}
      onScroll={onScroll}
      refreshControl={managedRefreshControl}
    >
      <Animated.View
        style={[
          minHeightContentContainerStyle,
          { paddingTop: originalHeaderHeight },
        ]}
      >
        {/* content */}
      </Animated.View>
    </Animated.ScrollView>
  )}
</HeaderMotion.ScrollManager>
```

### Hooks

#### `useMotionProgress()`

Returns:

- `progress` (`SharedValue<number>`)
- `progressThreshold` (`SharedValue<number>`)
- `measureTotalHeight` (`onLayout` callback)
- `measureDynamic` (`onLayout` callback)
- `animatedHeaderBaseProps` (required by `AnimatedHeaderBase`)
- `activeScrollId` (`SharedValue<string> | undefined`)

Only use inside the `HeaderMotion` provider tree.

#### `useScrollManager(scrollId?)`

Lower-level orchestration hook that powers the component APIs. Returns:

- `scrollableProps`: `{ onScroll, scrollEventThrottle, ref }`
- `headerMotionContext`:
  - `originalHeaderHeight` (`SharedValue<number>`)
  - `minHeightContentContainerStyle` (helps when content is shorter than the threshold)

#### `useActiveScrollId(initialId)`

Helper for multi-scroll scenarios (tabs/pager). Returns:

- `[active, setActive]`
- `active.state` (React state)
- `active.sv` (SharedValue)

### Base components

#### `HeaderBase`

Non-animated absolutely positioned header base.

#### `AnimatedHeaderBase`

Reanimated-powered, absolutely positioned header base.

- Requires `animatedHeaderBaseProps` from `useMotionProgress()` / `HeaderMotion.Header`.
- It is required for header panning functionality.
- Optional `withGestureHandlerRootView` can wrap this header in `GestureHandlerRootView` when needed.

### Types

- `WithCollapsibleHeaderProps` – convenience type for headers using motion progress props.
- `WithCollapsiblePagedHeaderProps` – like above, plus `activeTab` and `onTabChange`.

## Additional notes

### Refresh Control (v.0.3.0+)

Refresh control support was improved in `v0.3.0+`.

- If you use `HeaderMotion.ScrollView` or `HeaderMotion.FlatList`, your refresh-control usage stays the same as in React Native.
- If you use `HeaderMotion.ScrollManager` directly for custom integrations, pass refresh-related props to `ScrollManager`:
  - `refreshControl`
  - `refreshing`
  - `onRefresh`
  - optional `progressViewOffset`

This is important because scrollable positioning affects refresh-control behavior and needs to stay coupled with measured header height.

#### Platform support note:

- Support for Refresh Control is currently partial.
- Android works well with the current implementation.
- iOS behavior is still not fully deterministic.
- `progressViewOffset` does not seem to be reliable on iOS in all scenarios.
- Other iOS approaches tried so far introduced different issues.
- Additional iOS support improvements are planned for future releases.

## Contributing

- Development workflow: see [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
