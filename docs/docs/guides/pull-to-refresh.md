---
sidebar_position: 11
title: Pull to refresh
---

# Pull to refresh

Pull to refresh is tricky with collapsible headers. The header is overlayed on top of the scroll content, and the content itself is offset — so the refresh indicator needs to account for the header height to appear in the right place.

Header Motion handles this under the hood by adjusting `progressViewOffset` on `RefreshControl` to match the current header height. From your perspective, the API is identical to standard React Native refresh.

## Usage

Pass `refreshing` and `onRefresh` props directly to the scrollable, just like you would with a regular `ScrollView` or `FlatList`:

```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = () => {
  setIsRefreshing(true);
  fetchData().finally(() => setIsRefreshing(false));
};

<HeaderMotion.ScrollView
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
>
  {/* content */}
</HeaderMotion.ScrollView>
```

You can also pass an explicit `RefreshControl` component if you need more control over its styling:

```tsx
<HeaderMotion.ScrollView
  refreshControl={
    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
  }
>
  {/* content */}
</HeaderMotion.ScrollView>
```

## Platform notes

:::info
Android works well with the adjusted `progressViewOffset`.

On iOS, `progressViewOffset` is not fully reliable in all scenarios — the refresh indicator may not always appear in the expected position. We're aware of this and improvements for iOS are planned.
:::

## Using with ScrollManager

If you're using `ScrollManager` directly instead of a pre-built scrollable, pass the refresh-related props (`refreshing`, `onRefresh`, or `refreshControl`) to `ScrollManager` itself — not to the inner scrollable component.

## What's next?

Learn how to make the header react to overscrolling in [Overscroll](./overscroll).
