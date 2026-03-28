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
- **Pannable header support:** `pannable` and `panDecayConfig` now live directly on `HeaderMotion.Header`.
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

When you read `progressThreshold` from `useMotionProgress()`, it is a `SharedValue<number>`.
Read it inside worklets via `progressThreshold.get()` (or `progressThreshold.value`).

### 3) Measurement functions

The library gives you two measurement callbacks that you pass to your header layout:

- `measureTotalHeight` – attach to the _outer_ header container to measure the total header height. Scrollables use this to offset content so it starts below the header.
- `measureDynamic` – attach to the part of the header that determines the threshold (often the animated/dynamic portion).

## Why `HeaderMotion.Bridge` / `HeaderMotion.NavigationBridge` exist

When you pass a `header` component to React Navigation / Expo Router, that header is rendered by the navigator in a different part of the React tree.

Because of that, the navigation header **cannot read the `HeaderMotion` context** directly.

Use:

- `HeaderMotion.Bridge` to read the full context inside the provider tree
- `HeaderMotion.NavigationBridge` to re-provide that same context inside the navigation-rendered header subtree

Once bridged, your header component can call `useMotionProgress()` normally.

## Why `HeaderMotion.Header` uses absolute positioning

Navigation headers are special:

- Even with `headerTransparent: true`, the navigator can still reserve layout space for the header container.
- If you animate with translations without absolute positioning, you can end up with:
  - content below becoming unclickable (an invisible parent header still sits on top), or
  - content hidden under the header container.

`HeaderMotion.Header` is **absolutely positioned by default** (`overlay={true}`) to avoid those layout traps, which is especially important when you use transforms/translations.

## When to use components vs hooks

You can use either style; pick based on your integration needs:

- Prefer **components** when you want a “batteries included” wiring:

  - `HeaderMotion.ScrollView` / `HeaderMotion.FlatList` for common scrollables
  - `createHeaderMotionScrollable()` for reusable wrappers around custom scrollables
  - `HeaderMotion.ScrollManager` for one-off custom scrollables via render-props

- Prefer **hooks** when you want to build your own wrappers:
  - `useScrollManager()` (same engine as `HeaderMotion.ScrollManager`, but hook-based)
  - `useMotionProgress()` when your header is inside the provider tree

Also:

- Use `HeaderMotion.Bridge` + `HeaderMotion.NavigationBridge` when your header is rendered by navigation.
- Use `HeaderMotion.Header` + `HeaderMotion.Header.Dynamic` to wire header measurement automatically.
- Use `useMotionProgress` when you only need `progress` and `progressThreshold`.

## Examples

### Example app

Examples live in the example app: `example/`. They demonstrate a few cases, from simple animations, to scroll orchestration and persisted header animation state between different tabs (e.g. with `react-native-pager-view`).

Those examples use Expo Router as the navigation library, but it should be fairly simple to do the same with plain React Navigation.

### Expo Router / React Navigation

This is the core pattern used in the example app (`example/src/app/new-api.tsx`).

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
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
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
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

function MyHeader() {
  const { progress, progressThreshold } = useMotionProgress();
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
    <HeaderMotion.Header style={[{ paddingTop: insets.top }, containerStyle]}>
      <HeaderMotion.Header.Dynamic>
        {/* “dynamic” part of the header */}
      </HeaderMotion.Header.Dynamic>

      <View>{/* "regular" part of the header */}</View>
    </HeaderMotion.Header>
  );
}
```

### Tabs / pager: synchronizing multiple scrollables

If you have multiple scrollables (e.g. pages in `react-native-pager-view`), you can keep a single header progress by:

1. Creating a shared “active scroll id” using `useActiveScrollId()`
2. Passing `activeScrollId.sv` to `<HeaderMotion activeScrollId={...} />`
3. Rendering each page scrollable with a unique `scrollId`

The example app shows this pattern in `example/src/app/collapsible-pager.tsx` using `HeaderMotion.ScrollManager`.

### Keeping the native header + custom animated content below

If you want to keep the native header for back buttons/title, render your animated content _inside the screen_ under the native header:

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
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
  const { progress, progressThreshold } = useMotionProgress();

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
    <HeaderMotion.Header style={containerStyle}>
      <HeaderMotion.Header.Dynamic>
        {/* custom animated content below the native header */}
      </HeaderMotion.Header.Dynamic>
      <View>{/* sticky part */}</View>
    </HeaderMotion.Header>
  );
}
```

## API

The package exports a default compound component plus hooks, types, and named aliases.

### `HeaderMotion` (default export)

`HeaderMotion` is a compound component:

- `HeaderMotion` (provider)
- `HeaderMotion.Header` (header container)
- `HeaderMotion.Bridge` (bridge render-prop for navigation headers)
- `HeaderMotion.NavigationBridge` (re-provides context into navigation headers)
- `HeaderMotion.ScrollView` (pre-wired Animated.ScrollView)
- `HeaderMotion.FlatList` (pre-wired Animated.FlatList)
- `createHeaderMotionScrollable` (factory for reusable custom scrollables)
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
#### `HeaderMotion.Header`

Header container component that:

- measures total header height automatically
- supports direct header pan gestures
- renders an `Animated.View` by default
- applies absolute overlay positioning by default

```tsx
<HeaderMotion.Header overlay style={animatedStyle}>
  <HeaderMotion.Header.Dynamic>
    {/* dynamic measured section */}
  </HeaderMotion.Header.Dynamic>
</HeaderMotion.Header>
```

Props:

- `overlay?: boolean`
  - Defaults to `true`
- `pannable?: boolean`
  - Enables direct pan gestures on that specific header instance.
- `panDecayConfig?: WithDecayConfig | ((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => WithDecayConfig)`
  - Optional momentum config used after the header pan ends.
  - If you pass a function, it runs inside the gesture end worklet and must be worklet-safe.
- `withGestureHandlerRootView?: boolean`
- `asChild?: boolean`

When `asChild` is `true`, pass a single child that accepts `onLayout`.

#### `HeaderMotion.Header.Dynamic`

Dynamic measured section of the header.

- renders an `Animated.View` by default
- wires `measureDynamic` automatically
- supports `asChild`

#### `HeaderMotion.Bridge`

Render-prop bridge for navigation-rendered headers.

```tsx
<HeaderMotion.Bridge>
  {(value) => /* pass value into HeaderMotion.NavigationBridge */}
</HeaderMotion.Bridge>
```

#### `HeaderMotion.NavigationBridge`

Re-provides header motion context in a separate subtree, typically inside a navigation header.

#### `HeaderMotion.ScrollView`

Animated ScrollView wired with:

- `onScroll` handler
- `ref`
- automatic content offset based on measured header height

Supports:

- `scrollId?: string` for multi-scroll scenarios
- `headerOffsetStrategy?: 'padding' | 'margin' | 'top' | 'translate' | 'none'`
- `ensureScrollableContentMinHeight?: boolean`
  Experimental. Defaults to `false`.

`padding` is the default and recommended option. `top` and `translate` also add bottom compensation internally so the end of the content remains reachable.

#### `HeaderMotion.FlatList`

Animated FlatList wired similarly to the ScrollView.

Supports:

- `scrollId?: string` for multi-scroll scenarios
- `headerOffsetStrategy?: 'padding' | 'margin' | 'top' | 'translate' | 'none'`
- `ensureScrollableContentMinHeight?: boolean`
  Experimental. Defaults to `false`.

#### `createHeaderMotionScrollable(Component, options?)`

Named export for building reusable scrollable wrappers on top of `useScrollManager()`.
This is the same abstraction used internally by `HeaderMotion.ScrollView` and `HeaderMotion.FlatList`.

Returned components support:

- `scrollId?: string`
- `headerOffsetStrategy?: 'padding' | 'margin' | 'top' | 'translate' | 'none'`
- `ensureScrollableContentMinHeight?: boolean`
  Experimental. Defaults to `false`.

Use:

- `contentContainerMode: 'children'` for ScrollView-like components
- `contentContainerMode: 'renderScrollComponent'` for FlatList-like components
- `isComponentAnimated: true` when you pass an already animated component

The returned component keeps the wrapped component's prop shape, and list-like
generic components preserve item inference at usage time. Users do not need to
pass generics to `createHeaderMotionScrollable()` itself.

By default, the factory wraps the provided component with
`Animated.createAnimatedComponent()`.

Example:

```tsx
import { FlashList } from '@shopify/flash-list';
import { createHeaderMotionScrollable } from 'react-native-header-motion';

const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
});
```

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

Only use inside the `HeaderMotion` / `HeaderMotion.NavigationBridge` context tree.

#### `useHeaderMotionBridge()`

Returns the full bridge value used by `HeaderMotion.Bridge`.

Use this only for advanced integrations that need to move HeaderMotion context into another subtree manually.

#### `useScrollManager(scrollId?)`

Lower-level orchestration hook that powers the component APIs. Returns:

- `scrollableProps`: `{ onScroll, ref }`
- `headerMotionContext`:
  - `originalHeaderHeight` (`SharedValue<number>`)
  - `minHeightContentContainerStyle` (helps when content is shorter than the threshold)

#### `useActiveScrollId(initialId)`

Helper for multi-scroll scenarios (tabs/pager). Returns:

- `[active, setActive]`
- `active.state` (React state)
- `active.sv` (SharedValue)

### Types

- `HeaderMotionBridgeValue` – full bridge value passed through `HeaderMotion.Bridge`
- `HeaderProps` – props for `HeaderMotion.Header`
- `HeaderDynamicProps` – props for `HeaderMotion.Header.Dynamic`

## Additional notes

### Scroll event frequency

`scrollEventThrottle` is intentionally not managed by this library.

- Pass it directly to your scrollable when you need it.
- If you run into performance issues, try adjusting `scrollEventThrottle` to reduce how many scroll events this library processes.

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
