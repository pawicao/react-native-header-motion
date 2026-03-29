# React Native Header Motion

High-level APIs for orchestrating scroll-driven header motion in React Native.

This library is a wrapper around:

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [React Native Worklets](https://docs.swmansion.com/react-native-worklets/docs/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)

All credit for the underlying animation engine, worklets, gestures, and low-level primitives goes to those libraries. This package focuses on composing them into a specific higher-level use case: header motion and scroll orchestration.

This library does not ship a predesigned "collapsible header" UI. It gives you the pieces to:

- measure the parts of a header that matter
- derive a shared `progress` value from scroll
- keep multiple scrollables in sync when one header is shared across them
- bridge that state into navigation-rendered headers

You build the visuals yourself on top of that.

<div align="center">
  <img src="https://github.com/user-attachments/assets/b673349a-f26a-4cc8-bfe1-60d77deb4390" width="70%" />
</div>

## Version notes

- If you are upgrading from `v0.3.x`, read [MIGRATION-v1.md](./MIGRATION-v1.md).
- If you are still on the pre-v1 API and need the old docs, use the `v0` README:
  [README on branch `v0`](https://github.com/pawicao/react-native-header-motion/blob/v0/README.md)

## What's new in v1

The API change in v1 is quite substantial, but the migration is usually straightforward and the end result gives a much better developer experience.

- Header panning built on top of `react-native-gesture-handler`. Dragging on the header itself can initiate or continue the scroll interaction naturally instead of forcing the user to only use the scrollables.
- Context-first header API built around `HeaderMotion.Header` and `HeaderMotion.Header.Dynamic`
- Explicit navigation bridging with `HeaderMotion.Bridge` and `HeaderMotion.NavigationBridge`
- Narrower `useMotionProgress()` that focuses on `progress` and `progressThreshold`
- Reusable custom-scrollable factory via `createHeaderMotionScrollable()`
  - It's now easier than ever to wire up LegendList and FlashList to Header Motion!
- `react-native-gesture-handler` added to the peer dependency surface

## What this library is good at

- Scroll-driven animated headers
- Shared header state across tabs / pagers / multiple scrollables
- Navigation headers rendered outside the provider subtree
- Reusable wrappers around custom scrollables

## What this library is not trying to be

- A fully styled header component
- A page layout framework
- A general-purpose animation abstraction on top of Reanimated

## Requirements

Your app must provide:

- `react-native-gesture-handler >= 2.0.0`
- `react-native-reanimated >= 4.0.0`
- `react-native-worklets >= 0.4.0`

These are peer dependencies.

## Installation

```bash
npm i react-native-header-motion
```

or

```bash
yarn add react-native-header-motion
```

Then follow the normal setup instructions for:

- [Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation)
- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)
- [Worklets](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation)

## Mental model

There are four concepts to understand:

### 1. `progress`

`progress` is a `SharedValue<number>`.

- `0` means "expanded"
- `1` means "collapsed"

Most header animations should be derived from this value.

### 2. `progressThreshold`

`progressThreshold` is the collapse distance in pixels.

It can be:

- a fixed number
- a function derived from the measured dynamic part of the header

At runtime, `useMotionProgress()` gives you `progressThreshold` as a `SharedValue<number>`.

In practice, `progress` is calculated by mapping scroll distance across that threshold:

- before the threshold, `progress` moves from `0` toward `1`
- at the threshold, `progress` reaches `1`
- past the threshold, behavior depends on `progressExtrapolation`

### 3. Total header height vs dynamic header height

The library measures two different things:

- the total header height
- the dynamic part of the header that should define the collapse distance

`HeaderMotion.Header` wires the total-height measurement.

`HeaderMotion.Header.Dynamic` wires the dynamic measurement.

In many designs:

- the sticky/top part stays visible
- the dynamic part slides away
- the dynamic part is what should feed `progressThreshold`

### 4. Navigation headers are a separate tree

When a navigation library renders a header outside your screen subtree, it cannot read the `HeaderMotion` context directly.

That is why the library has:

- `HeaderMotion.Bridge`
- `HeaderMotion.NavigationBridge`

Use them only to move HeaderMotion context across that boundary.

## Recommended integration order

The library allows (and requires) you to integrate your scrollables with headers to provide animation behavior.

Use the simplest integration that fits your case:

1. `HeaderMotion.ScrollView` or `HeaderMotion.FlatList` - exported directly from the library
2. `createHeaderMotionScrollable()` - to easily create custom integrated scrollables on top of other scrollables (e.g. LegendList or FlashList)
3. `HeaderMotion.ScrollManager` / `useScrollManager()` - for even more custom scenarios

For custom scrollables, prefer `createHeaderMotionScrollable()` first.

Use the scroll managers only when the factory approach is not flexible enough.

## Quick start: navigation header

This is the core v1 pattern when your header is rendered by Expo Router / React Navigation.

```tsx
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <AppHeader />
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

function AppHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();

    return {
      transform: [
        {
          translateY: interpolate(
            progress.get(),
            [0, 1],
            [0, -threshold],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <HeaderMotion.Header
      style={[styles.header, { paddingTop: insets.top }, containerStyle]}
    >
      <HeaderMotion.Header.Dynamic>
        {/* collapsible part */}
      </HeaderMotion.Header.Dynamic>

      <View>{/* sticky part */}</View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#304077',
  },
});
```

## Quick start: inline header inside the screen

If your animated header lives in the same subtree as `HeaderMotion`, you do not need bridging at all.

```tsx
function Screen() {
  return (
    <HeaderMotion>
      <InlineHeader />
      <HeaderMotion.ScrollView>{/* content */}</HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

function InlineHeader() {
  const { progress, progressThreshold } = useMotionProgress();

  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic>
        {/* collapsible section */}
      </HeaderMotion.Header.Dynamic>
    </HeaderMotion.Header>
  );
}
```

## Shared header across multiple scrollables

If one header is shared across tabs or pager pages:

1. Create an active scroll id with `useActiveScrollId()`
2. Pass `activeScrollId.sv` to `HeaderMotion`
3. Give each scrollable a unique `scrollId`

```tsx
import { useRef } from 'react';
import PagerView from 'react-native-pager-view';

const indexToKey = new Map([
  [0, 'A'],
  [1, 'B'],
]);

function Screen() {
  const [activeScrollId, setActiveScrollId] = useActiveScrollId<'A' | 'B'>('A');
  const pagerRef = useRef<PagerView>(null);

  return (
    <HeaderMotion activeScrollId={activeScrollId.sv}>
      <HeaderMotion.Bridge>
        {(ctx) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={ctx}>
                  <Header />
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
        onPageSelected={(e) => {
          setActiveScrollId(indexToKey.get(e.nativeEvent.position)!);
        }}
      >
        <View key="A">
          <HeaderMotion.ScrollView scrollId="A">
            {/* page A content */}
          </HeaderMotion.ScrollView>
        </View>

        <View key="B">
          <HeaderMotion.ScrollView scrollId="B">
            {/* page B content */}
          </HeaderMotion.ScrollView>
        </View>
      </PagerView>
    </HeaderMotion>
  );
}
```

## Header panning

Sometimes the header itself takes up a large part of the screen, so forcing the user to move their finger back down to the scrollable can feel awkward.

In those cases, you can make the header surface itself drive the scroll interaction as well:

```tsx
function Header() {
  return (
    <HeaderMotion.Header pannable>
      <HeaderMotion.Header.Dynamic>
        {/* collapsible content */}
      </HeaderMotion.Header.Dynamic>
    </HeaderMotion.Header>
  );
}
```

## Public API

### Default export: `HeaderMotion`

Compound component with:

- `HeaderMotion.Header`
- `HeaderMotion.Bridge`
- `HeaderMotion.NavigationBridge`
- `HeaderMotion.ScrollView`
- `HeaderMotion.FlatList`
- `HeaderMotion.ScrollManager`

Provider props:

- `progressThreshold?: number | ((measuredDynamic: number) => number)`: collapse distance in pixels; when passed as a function, it is derived from the value measured by `HeaderMotion.Header.Dynamic`
- `measureDynamic?: (e) => number`: controls what value is read from the dynamic section's layout event; defaults to its height
- `measureDynamicMode?: 'mount' | 'update'`: `'mount'` measures once; `'update'` re-measures when the dynamic section lays out again
- `activeScrollId?: SharedValue<string>`: identifies which scrollable currently owns header progress in multi-scroll setups
- `progressExtrapolation?: ExtrapolationType`: controls how `progress` behaves outside the normal collapse range

### `HeaderMotion.Header`

Main header container.

Responsibilities:

- measures total header height
- applies overlay positioning by default
- can make the header surface pannable

Props:

- all normal `Animated.View` props in default mode: styles, accessibility props, pointer events, and other normal animated view props work as expected
- `overlay?: boolean`: keeps the header absolutely positioned above content; disable only if you intentionally want it in normal layout flow
- `pannable?: boolean`: allows dragging directly on the header surface to continue the scroll interaction
- `panDecayConfig?: WithDecayConfig | ((event) => WithDecayConfig)`: customizes the momentum animation after a header pan ends
- `withGestureHandlerRootView?: boolean`: wraps the gesture subtree in `GestureHandlerRootView` when that part of the tree is not already under one
- `asChild?: boolean`: injects the total-height measurement into a single child instead of rendering the default `Animated.View`

Use `asChild` when you want to inject the total-height measurement into a single child instead of rendering the default `Animated.View`.

### `HeaderMotion.Header.Dynamic`

Marks the part of the header whose layout should define the collapsible distance.

Use this for the section that visually disappears during collapse.

Props:

- all normal `Animated.View` props in default mode: use these as you would on any animated view
- `asChild?: boolean`: injects the dynamic measurement into a single child instead of rendering the default `Animated.View`

### `HeaderMotion.Bridge`

Reads the current HeaderMotion context and exposes it through a render function.

Use it to move the context into a navigation-rendered header subtree.

Props:

- `children: (value) => ReactNode`: receives the bridged HeaderMotion context value that should usually be passed into `HeaderMotion.NavigationBridge`

### `HeaderMotion.NavigationBridge`

Re-provides a previously captured HeaderMotion context value in another subtree.

Use it together with `HeaderMotion.Bridge`.

Props:

- `value`: the bridged HeaderMotion context captured by `HeaderMotion.Bridge`
- `children`: the subtree that should regain access to HeaderMotion context

### `HeaderMotion.ScrollView`

Pre-wired `Animated.ScrollView`.

Supports:

- `scrollId?: string`: unique id for this scrollable when one header is shared across multiple scrollables
- `headerOffsetStrategy?: 'padding' | 'margin' | 'top' | 'translate' | 'none'`: controls how content is pushed below the measured header
- `ensureScrollableContentMinHeight?: boolean`: experimental fallback for short content that otherwise could not scroll far enough to collapse the header fully
- `animatedRef?: AnimatedRef`: lets you reuse your own animated ref instead of letting HeaderMotion create one

### `HeaderMotion.FlatList`

Pre-wired `Animated.FlatList`.

Supports the same HeaderMotion-specific props as `HeaderMotion.ScrollView`.

### `createHeaderMotionScrollable(Component, options?)`

Factory for creating reusable HeaderMotion-aware wrappers around custom scrollables.

Prefer this over the scroll managers whenever it is enough.

Useful options:

- `displayName`: custom component name shown in React DevTools
- `isComponentAnimated`: set this when the input component is already animated and should not be wrapped again
- `contentContainerMode: 'children' | 'renderScrollComponent'`: tells HeaderMotion how to inject content offsetting for that scrollable shape

Use:

- `'children'` for ScrollView-like components
- `'renderScrollComponent'` for FlatList-like components

Examples:

`FlashList`

```tsx
import { FlashList } from '@shopify/flash-list';
import { createHeaderMotionScrollable } from 'react-native-header-motion';

const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
  contentContainerMode: 'renderScrollComponent',
});
```

`LegendList`

```tsx
import { LegendList } from '@legendapp/list';
import { createHeaderMotionScrollable } from 'react-native-header-motion';

const HeaderMotionLegendList = createHeaderMotionScrollable(LegendList, {
  displayName: 'HeaderMotionLegendList',
  isComponentAnimated: true,
  contentContainerMode: 'renderScrollComponent',
});
```

### `HeaderMotion.ScrollManager`

Render-prop fallback for complex custom integrations.

Most code should prefer `createHeaderMotionScrollable()`.

Use `ScrollManager` only when you need a custom composition that the factory API cannot express cleanly.

Props:

- `scrollId?: string`: unique id for this scrollable when one header is shared across multiple scrollables
- `children`: render function that receives `scrollableProps` and `headerMotionContext`
- plus the same refresh / ref options accepted by `useScrollManager()`

### Hooks

#### `useMotionProgress()`

Returns:

- `progress`: `SharedValue<number>` that typically moves from `0` at expanded state to `1` at collapsed state
- `progressThreshold`: `SharedValue<number>` representing the collapse distance in pixels

This is the primary animation hook for header UI.

#### `useHeaderMotionBridge()`

Returns the full internal bridge value.

Most app code should not need this. Prefer `useMotionProgress()` unless you are explicitly bridging context across a tree boundary.

Returns:

- full HeaderMotion context value, including measurement callbacks and scroll synchronization internals

#### `useActiveScrollId(initialId)`

Returns:

- `{ state, sv }`: `state` is the React value for UI logic, `sv` is the matching shared value for HeaderMotion
- setter function: updates both in sync

Use this for multi-scroll setups.

#### `useScrollManager(scrollId?, options?)`

Hook-level fallback for complex custom scrollables.

Most code should prefer `createHeaderMotionScrollable()`.

Parameters:

- `scrollId`: unique id for this scrollable when one header is shared across multiple scrollables
- `options`: optional ref, refresh, and event-handler configuration

Returns:

- `scrollableProps`: props to spread onto the scrollable itself, including the managed ref, scroll handlers, and resolved refresh control
- `headerMotionContext`: layout values for offsetting content below the measured header, including `originalHeaderHeight` and optional `contentContainerMinHeight`

## Notes

### Why `HeaderMotion.Header` is absolute by default

Headers rendered by navigation are often easier to animate and interact with when they are visually overlayed above content rather than participating in normal layout flow.

That is why `overlay` defaults to `true`.

Disable it only when you intentionally want the header in normal layout flow.

### `ensureScrollableContentMinHeight` (experimental)

This is available on the pre-wired scrollables and the custom-scrollable APIs.

It is useful when content is too short to naturally scroll through the full collapse distance.

This feature is still experimental.

### Scroll event frequency

`scrollEventThrottle` is intentionally not managed by this library.

Pass it directly to your scrollable when you need it.

If you run into performance issues, try adjusting `scrollEventThrottle` to reduce how many scroll events this library processes.

### Refresh control

If you use `HeaderMotion.ScrollView` or `HeaderMotion.FlatList`, your refresh-control usage stays the same as in React Native.

If you use `HeaderMotion.ScrollManager` directly for custom integrations, pass refresh-related props to `ScrollManager` itself:

- `refreshControl`
- `refreshing`
- `onRefresh`
- optional `progressViewOffset`

This matters because scrollable positioning affects refresh-control behavior and needs to stay coupled with the measured header height.

Platform support note:

- Support for Refresh Control is currently partial.
- Android works well with the current implementation.
- iOS behavior is still not fully deterministic.
- `progressViewOffset` does not seem to be reliable on iOS in all scenarios.
- Other iOS approaches tried so far introduced different issues.
- Additional iOS support improvements are planned for future releases.

## Examples

See the example app in [`example/`](./example/).

Useful files:

- [`example/src/app/simple.tsx`](./example/src/app/simple.tsx)
- [`example/src/app/flashlist.tsx`](./example/src/app/flashlist.tsx)
- [`example/src/app/legend-list.tsx`](./example/src/app/legend-list.tsx)
- [`example/src/app/pager-header-pan.tsx`](./example/src/app/pager-header-pan.tsx)
- [`example/src/app/collapsible-pager.tsx`](./example/src/app/collapsible-pager.tsx)

## Contributing

Development workflow: see [CONTRIBUTING.md](./CONTRIBUTING.md)

Code of conduct: see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## License

MIT

Made with [`create-react-native-library`](https://github.com/callstack/react-native-builder-bob)
