---
sidebar_position: 3
title: CollapsibleTabs
---

# CollapsibleTabs

`CollapsibleTabs` shares one collapsible header across multiple swipeable pages. It absorbs everything the low-level [multi-tab setup](../guides/multiple-tabs-pages) wires by hand: the `useActiveScrollId()` state, the per-scrollable `scrollId`s, and the pager coordination.

```tsx
import { Collapsible, CollapsibleTabs } from 'react-native-header-motion';

<CollapsibleTabs tabs={['posts', 'about']} preset="parallax">
  <Collapsible.Header>
    <Collapsible.Pinned><TitleRow /></Collapsible.Pinned>
    <Collapsible.Dynamic><Hero /></Collapsible.Dynamic>
    <CollapsibleTabs.Bar />
  </Collapsible.Header>

  <CollapsibleTabs.Pager>
    <CollapsibleTabs.Tab name="posts">
      <Collapsible.FlatList data={posts} renderItem={renderPost} />
    </CollapsibleTabs.Tab>
    <CollapsibleTabs.Tab name="about">
      <Collapsible.ScrollView>{about}</Collapsible.ScrollView>
    </CollapsibleTabs.Tab>
  </CollapsibleTabs.Pager>
</CollapsibleTabs>
```

Note what's absent: no `scrollId` props, no active-id state, no pager event wiring. Each `CollapsibleTabs.Tab` provides its `name` as the default `scrollId` through context, so **any** header-motion scrollable inside it — including custom ones from `createHeaderMotionScrollable()` — participates automatically. An explicit `scrollId` prop still wins if you need to override.

## Parts

- **`CollapsibleTabs`** — the root. Extends [`Collapsible`](./collapsible) (same `preset` and pass-through props) and owns the active-tab state.
- **`CollapsibleTabs.Pager`** — renders the pages through a pager adapter and keeps it in sync with the active tab.
- **`CollapsibleTabs.Tab`** — one page; provides its `name` as the default `scrollId`.
- **`CollapsibleTabs.Bar`** — a minimal, deliberately unstyled tab bar. For a custom one, build on `useCollapsibleTabs()`.

All of it works inside `Collapsible.NavigationHeader` too — the tabs context is bridged across the navigation boundary automatically, so `CollapsibleTabs.Bar` can live in a navigation-rendered header.

## Props

### `CollapsibleTabs`

Everything from `Collapsible` except `activeScrollId` (owned internally), plus:

| Prop          | Type                                          | Default          | Description                                                             |
| ------------- | --------------------------------------------- | ---------------- | ----------------------------------------------------------------------- |
| `tabs`        | `(string \| { name, label? })[]`              | —                | The tabs in pager order. Labels are what `CollapsibleTabs.Bar` renders. |
| `initialTab`  | `string`                                      | first tab        | Name of the initially active tab.                                       |
| `onTabChange` | `(name: string) => void`                      | —                | Called when the active tab changes, from a swipe or `goTo`.             |

### `CollapsibleTabs.Pager`

| Prop      | Type                          | Default          | Description                              |
| --------- | ----------------------------- | ---------------- | ---------------------------------------- |
| `adapter` | `CollapsibleTabsPagerAdapter` | built-in pager   | The pager engine. See below.             |
| `style`   | `ViewStyle`                   | `{ flex: 1 }`    | Style for the pager container.           |

## Pager engines

The pager is pluggable through a tiny adapter interface, so the library itself has **zero pager dependencies**.

**Built-in default** — a paging horizontal `ScrollView`. No extra install, keeps all pages mounted, supports swipe and programmatic changes.

**`react-native-pager-view`** — for native pager behavior, hand your app's `PagerView` to the factory. The library never imports the package itself, so it stays a dependency of *your* app:

```tsx
import PagerView from 'react-native-pager-view';
import { createPagerViewAdapter } from 'react-native-header-motion';

const pagerAdapter = createPagerViewAdapter(PagerView);

<CollapsibleTabs.Pager adapter={pagerAdapter}>
```

**Custom** — implement `CollapsibleTabsPagerAdapter`: a component receiving `{ initialIndex, onIndexChange, controllerRef, style, children }`. Render `children` (one element per tab), report user-driven page changes through `onIndexChange`, and assign `{ setIndex }` to `controllerRef` for programmatic changes.

## Custom tab bars

`useCollapsibleTabs()` exposes the tab state anywhere in the tree:

```tsx
import { useCollapsibleTabs } from 'react-native-header-motion';

function MyTabBar() {
  const { tabs, activeTab, goTo } = useCollapsibleTabs();

  return (
    <View style={styles.row}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.name}
          label={tab.label}
          isActive={tab.name === activeTab}
          onPress={() => goTo(tab.name)}
        />
      ))}
    </View>
  );
}
```
