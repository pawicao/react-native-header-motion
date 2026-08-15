---
sidebar_position: 1
title: Collapsible
---

# Collapsible

`Collapsible` is the high-level, preset-driven way to build a collapsible header. It wraps the `HeaderMotion` primitives — the provider, the measured header, the animated styles — into a compound component where you compose the header from explicit parts and pick a [preset](./presets) for the animation.

Everything `Collapsible` does is built on the public low-level API, and every low-level prop passes through. You can start high-level and drop down at any point.

## Anatomy

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

Each part names the *role* a piece of UI plays while the header collapses:

- **`Collapsible`** — the root provider. Renders a `HeaderMotion` provider, resolves the `preset`, and shares both with the parts. No visual output.
- **`Collapsible.Header`** — the header frame. Measures the total header height (like `HeaderMotion.Header`) and slides up by the collapse distance as the user scrolls.
- **`Collapsible.Pinned`** — content that stays visually in place (a title row, actions). It counter-translates against the frame's slide.
- **`Collapsible.Dynamic`** — the collapsing section. Its measured height defines the collapse distance (like `HeaderMotion.Header.Dynamic`), and the active preset animates its content. Anything after it (like the `SearchBar` above) simply rides up and ends docked under the pinned content.
- **`Collapsible.NavigationHeader`** — a `Collapsible.Header` rendered by a navigation library. It fuses the `Bridge` / `NavigationBridge` wiring into one component: compose the header as children, and use `render` to place the prepared element into your navigator.
- **`Collapsible.ScrollView` / `Collapsible.FlatList`** — the same pre-wired scrollables as `HeaderMotion.ScrollView` / `HeaderMotion.FlatList`, re-exported for a self-contained import surface. Custom scrollables from `createHeaderMotionScrollable()` work here too.

## Overlay headers without navigation

If your header is not rendered by a navigation library, use `Collapsible.Header` directly — it overlays the content by default, exactly like the low-level `HeaderMotion.Header`:

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

Accepts every `HeaderMotion` prop (`progressThreshold`, `measureDynamic`, `measureDynamicMode`, `activeScrollId`, `progressExtrapolation`), plus:

| Prop            | Type                                        | Default      | Description                                                                                       |
| --------------- | ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `preset`        | `CollapsiblePresetInput`                    | `'collapse'` | How the collapsing content animates. See [Presets](./presets).                                    |
| `onStateChange` | `(state: 'expanded' \| 'collapsed') => void` | —            | Called when the header settles into a terminal state.                                             |

### `Collapsible.Header` / `Collapsible.NavigationHeader`

Accept all `HeaderMotion.Header` props except `asChild` (`overlay`, `pannable`, `panDecayConfig`, `withGestureHandlerRootView`, any `Animated.View` prop). `Collapsible.NavigationHeader` additionally requires:

| Prop     | Type                                  | Description                                                    |
| -------- | ------------------------------------- | -------------------------------------------------------------- |
| `render` | `(header: ReactElement) => ReactNode` | Places the prepared, context-bridged header into your navigator. |

### `Collapsible.Dynamic`

Accepts all `HeaderMotion.Header.Dynamic` props except `asChild`, plus:

| Prop           | Type                    | Description                                                                                                      |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `contentStyle` | `Animated.View` `style` | Style for the inner content view the preset effects animate. Layout styles for the measured wrapper go on `style`. |

The wrapper clips its content by default (`overflow: 'hidden'`); override it through `style` if needed.

### `Collapsible.Pinned`

Accepts all `Animated.View` props.

## Imperative control

`useCollapsibleHeader()` exposes the motion state plus imperative controls, anywhere inside the tree (it also works in plain `HeaderMotion` trees):

```tsx
import { useCollapsibleHeader } from 'react-native-header-motion';

const { progress, progressThreshold, collapse, expand } = useCollapsibleHeader();

collapse(); // scrolls the active scrollable until the header is collapsed
expand({ animated: false });
```

## Pull to refresh

The scrollables accept `refreshControl` (and `refreshing` / `onRefresh`) exactly like their low-level counterparts — see [Pull to refresh](../guides/pull-to-refresh). Custom refresh indicators compose naturally into the header as regular children of `Collapsible.Header`.
