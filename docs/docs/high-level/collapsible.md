---
sidebar_position: 1
title: Collapsible
---

# Collapsible

:::caution Alpha
This API is in alpha. It can change in any release, including patch releases. Pin the exact version. [Issue #31](https://github.com/pawicao/react-native-header-motion/issues/31) lists the changes we plan.
:::

`Collapsible` builds a collapsible header from presets. It uses the `HeaderMotion` provider, the measured header, and the animated styles for you. You compose the header from parts and select a [preset](./presets) for the animation.

`Collapsible` uses only the public low-level API, and it passes every low-level prop through. You can change to the low-level API at any time.

## Parts

```tsx
import { Collapsible } from 'react-native-header-motion';
import { Stack } from 'expo-router';

export default function Screen() {
  return (
    <Collapsible preset="parallax">
      <Collapsible.NavigationHeader
        render={(header) => <Stack.Screen options={{ header: () => header }} />}
      >
        <Collapsible.Pinned>
          <TitleRow />
        </Collapsible.Pinned>
        <Collapsible.Dynamic>
          <Hero />
        </Collapsible.Dynamic>
        <SearchBar />
      </Collapsible.NavigationHeader>

      <Collapsible.ScrollView>{content}</Collapsible.ScrollView>
    </Collapsible>
  );
}
```

Each part sets how its content moves when the header collapses:

- **`Collapsible`** is the root. It renders a `HeaderMotion` provider and gives the `preset` to the parts. It shows nothing on screen.
- **`Collapsible.Header`** is the header frame. It measures the full header height, as `HeaderMotion.Header` does. It moves up by the collapse distance when the user scrolls.
- **`Collapsible.Pinned`** holds content that stays in the same screen position, for example a title row or action buttons. It moves down by the same distance that the frame moves up. Put it above `Collapsible.Dynamic`.
- **`Collapsible.Dynamic`** is the section that collapses. Its measured height sets the collapse distance, as `HeaderMotion.Header.Dynamic` does. The preset animates its content. Content below it, such as the `SearchBar` above, moves up and stops under the pinned content.
- **`Collapsible.NavigationHeader`** is a `Collapsible.Header` that a navigation library renders. It replaces the `Bridge` and `NavigationBridge` steps. Put the header content in its children, and use `render` to give the header to your navigator.
- **`Collapsible.ScrollView`** and **`Collapsible.FlatList`** are the same components as `HeaderMotion.ScrollView` and `HeaderMotion.FlatList`. Custom scrollables from `createHeaderMotionScrollable()` also work.

## Headers without a navigation library

If a navigation library does not render your header, use `Collapsible.Header`. It shows on top of the content, as `HeaderMotion.Header` does:

```tsx
<Collapsible preset="fade">
  <Collapsible.Header style={styles.header}>
    <Collapsible.Pinned>
      <TitleRow />
    </Collapsible.Pinned>
    <Collapsible.Dynamic>
      <Hero />
    </Collapsible.Dynamic>
  </Collapsible.Header>
  <Collapsible.ScrollView>{content}</Collapsible.ScrollView>
</Collapsible>
```

## Props

### `Collapsible`

Accepts all `HeaderMotion` props (`progressThreshold`, `measureDynamic`, `measureDynamicMode`, `activeScrollId`, `progressExtrapolation`), and these props:

| Prop            | Type                                         | Default      | Description                                                       |
| --------------- | -------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `preset`        | `CollapsiblePresetInput`                     | `'collapse'` | How the collapsing content moves. See [Presets](./presets).       |
| `onStateChange` | `(state: 'expanded' \| 'collapsed') => void` | —            | Called when the header becomes fully expanded or fully collapsed. |

### `Collapsible.Header` and `Collapsible.NavigationHeader`

Accept all `HeaderMotion.Header` props except `asChild`: `overlay`, `pannable`, `panDecayConfig`, `withGestureHandlerRootView`, and all `Animated.View` props. `Collapsible.NavigationHeader` also needs this prop:

| Prop     | Type                                  | Description                                                                            |
| -------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `render` | `(header: ReactElement) => ReactNode` | Puts the header into your navigator. The header already has all the contexts it needs. |

### `Collapsible.Dynamic`

Accepts all `HeaderMotion.Header.Dynamic` props except `asChild`, and this prop:

| Prop           | Type                    | Description                                                                                               |
| -------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `contentStyle` | `Animated.View` `style` | Style for the inner view that the preset animates. Put layout styles for the measured wrapper on `style`. |

The wrapper clips its content (`overflow: 'hidden'`). To change this, set `overflow` in `style`.

### `Collapsible.Pinned`

Accepts all `Animated.View` props.

## Collapse and expand from code

`useCollapsibleHeader()` gives the motion values and two functions, `collapse()` and `expand()`. You can use it anywhere in the tree, also in a plain `HeaderMotion` tree:

```tsx
import { useCollapsibleHeader } from 'react-native-header-motion';

const { progress, progressThreshold, collapse, expand } =
  useCollapsibleHeader();

collapse(); // scrolls the active scrollable until the header is fully collapsed
expand({ animated: false });
```

## Pull to refresh

The scrollables accept `refreshing`, `onRefresh`, and `refreshControl`, as their low-level versions do. For a custom refresh indicator, use `HeaderMotion.RefreshControl` and read its state with `useRefreshControl()` in the header. See [Pull to refresh](../guides/pull-to-refresh#headless-refresh-ui).
