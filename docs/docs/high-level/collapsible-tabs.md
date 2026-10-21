---
sidebar_position: 3
title: CollapsibleTabs
---

# CollapsibleTabs

:::caution Alpha
This API is in alpha. It can change in any release, including patch releases. Pin the exact version. [Issue #31](https://github.com/pawicao/react-native-header-motion/issues/31) lists the changes we plan.
:::

`CollapsibleTabs` uses one collapsible header for many pages that the user can swipe between. It does the steps that the low-level [multi-tab setup](../guides/multiple-tabs-pages) needs you to do: the `useActiveScrollId()` state, a `scrollId` for each scrollable, and the pager events.

```tsx
import { Collapsible, CollapsibleTabs } from 'react-native-header-motion';

<CollapsibleTabs tabs={['posts', 'about']} preset="parallax">
  <Collapsible.Header>
    <Collapsible.Pinned>
      <TitleRow />
    </Collapsible.Pinned>
    <Collapsible.Dynamic>
      <Hero />
    </Collapsible.Dynamic>
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
</CollapsibleTabs>;
```

You do not set `scrollId` props, active-tab state, or pager events. Each `CollapsibleTabs.Tab` gives its `name` to the scrollables inside it as their default `scrollId`. This also applies to custom scrollables from `createHeaderMotionScrollable()`. A `scrollId` prop on a scrollable overrides the default.

## Parts

- **`CollapsibleTabs`** is the root. It accepts the same props as [`Collapsible`](./collapsible) and keeps the active-tab state.
- **`CollapsibleTabs.Pager`** shows the pages through a pager adapter. It makes sure that the pager shows the active tab.
- **`CollapsibleTabs.Tab`** is one page. It gives its `name` to the scrollables inside it as their default `scrollId`.
- **`CollapsibleTabs.Bar`** is a simple tab bar with little styling. To make your own tab bar, use `useCollapsibleTabs()`.

All parts also work inside `Collapsible.NavigationHeader`. It gives the tabs context to the navigation header, so you can put `CollapsibleTabs.Bar` in a header that a navigation library renders.

## Props

### `CollapsibleTabs`

Accepts all `Collapsible` props except `activeScrollId`, because `CollapsibleTabs` sets it. Also accepts these props:

| Prop          | Type                             | Default   | Description                                                         |
| ------------- | -------------------------------- | --------- | ------------------------------------------------------------------- |
| `tabs`        | `(string \| { name, label? })[]` | —         | The tabs, in pager order. `CollapsibleTabs.Bar` shows the labels.   |
| `initialTab`  | `string`                         | first tab | Name of the tab to show first.                                      |
| `onTabChange` | `(name: string) => void`         | —         | Called when the active tab changes, after a swipe or a `goTo` call. |

Give the `CollapsibleTabs.Tab` children in the same order as `tabs`. If the order is different, you get a warning in development.

### `CollapsibleTabs.Pager`

| Prop      | Type                          | Default        | Description                    |
| --------- | ----------------------------- | -------------- | ------------------------------ |
| `adapter` | `CollapsibleTabsPagerAdapter` | built-in pager | The pager to use. See below.   |
| `style`   | `ViewStyle`                   | `{ flex: 1 }`  | Style for the pager container. |

## Pagers

`CollapsibleTabs.Pager` uses an adapter to show the pages. Thus, the library does not depend on a pager package.

**Built-in pager.** This is a horizontal `ScrollView` with paging. You do not install more packages. It keeps all pages mounted and supports swipes and page changes from code.

**`react-native-pager-view`.** For a native pager, give your app's `PagerView` to `createPagerViewAdapter()`. The library does not import the package, so it stays a dependency of your app only:

```tsx
import PagerView from 'react-native-pager-view';
import { createPagerViewAdapter } from 'react-native-header-motion';

const pagerAdapter = createPagerViewAdapter(PagerView);

<CollapsibleTabs.Pager adapter={pagerAdapter}>
```

**Custom pager.** Write a component of type `CollapsibleTabsPagerAdapter`. It gets these props: `initialIndex`, `onIndexChange`, `controllerRef`, `style`, and `children`. The component must:

1. Render `children`, one element for each tab.
2. Call `onIndexChange` when the user changes the page.
3. Set `controllerRef` to an object with a `setIndex` function, so that the library can change the page from code.

## Custom tab bars

Use `useCollapsibleTabs()` to read the tab state anywhere in the tree:

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
