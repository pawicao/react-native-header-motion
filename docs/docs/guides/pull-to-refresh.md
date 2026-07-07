---
sidebar_position: 11
title: Pull to refresh
---

# Pull to refresh

Pull to refresh is tricky with collapsible headers. The header is overlayed on top of the scroll content, and the content itself is offset — so the refresh indicator needs to account for the header height to appear in the right place.

Header Motion supports two refresh modes:

- React Native-compatible refresh, where Header Motion adjusts `progressViewOffset` for the built-in `RefreshControl`.
- Headless refresh, where `HeaderMotion.RefreshControl` triggers refresh behavior and exposes progress through `useRefreshControl()` so your header can render the UI.

## Usage

Pass `refreshing` and `onRefresh` props directly to the scrollable, just like you would with a regular `ScrollView` or `FlatList`:

```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = () => {
  setIsRefreshing(true);
  fetchData().finally(() => setIsRefreshing(false));
};

<HeaderMotion.ScrollView refreshing={isRefreshing} onRefresh={handleRefresh}>
  {/* content */}
</HeaderMotion.ScrollView>;
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

## Headless refresh UI

Use `HeaderMotion.RefreshControl` when you want to render the refresh indicator yourself, usually inside the header:

```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = () => {
  setIsRefreshing(true);
  fetchData().finally(() => setIsRefreshing(false));
};

<HeaderMotion.ScrollView
  refreshControl={
    <HeaderMotion.RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  }
>
  {/* content */}
</HeaderMotion.ScrollView>;
```

Then read the refresh state anywhere inside the same `HeaderMotion` tree:

```tsx
import { useRefreshControl } from 'react-native-header-motion';
import { useAnimatedStyle } from 'react-native-reanimated';

const refresh = useRefreshControl();

const style = useAnimatedStyle(() => ({
  opacity: Math.min(refresh.progress.value, 1),
  transform: [{ scale: 0.8 + Math.min(refresh.progress.value, 1) * 0.2 }],
}));
```

The exposed state includes the UI-ready `progress`, advanced `rawProgress`, `pullDistance`, `triggerDistance`, `phase`, `overshoot`, and convenience booleans like `isReady`, `isRefreshing`, `isSettling`, and `isActive`.

Use `progressCommitDuration` to tune how quickly overshoot visually snaps back to committed refresh progress, and `progressSettleDuration` to tune the return to idle.

## Platform notes

:::info
Built-in Android refresh works well with the adjusted `progressViewOffset`.

For fully custom refresh UI, prefer `HeaderMotion.RefreshControl`. It does not render a native spinner.
:::

## Using with ScrollManager

If you're using `ScrollManager` directly instead of a pre-built scrollable, pass the refresh-related props (`refreshing`, `onRefresh`, or `refreshControl`) to `ScrollManager` itself — not to the inner scrollable component.

## What's next?

Learn how to make the header react to overscrolling in [Overscroll](./overscroll).
