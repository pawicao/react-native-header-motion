---
sidebar_position: 14
title: External refs
---

# External refs

Header Motion scrollables manage their own animated ref internally to track scroll position and drive header animations. If you need access to the scrollable ref yourself — for programmatic scrolling, measuring, or other imperative operations — you can pass your own ref via the `animatedRef` prop.

:::caution Important
The ref must be an animated ref from Reanimated (`useAnimatedRef()`), not a regular React ref.
:::

## Example

```tsx
import { useAnimatedRef, scrollTo } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

function Screen() {
  const scrollRef = useAnimatedRef();

  const handleScrollToTop = () => {
    scheduleOnUI(() => {
      'worklet';
      scrollTo(scrollRef, 0, 0, true);
    })();
  };

  return (
    <HeaderMotion>
      <HeaderMotion.ScrollView animatedRef={scrollRef}>
        {/* content */}
      </HeaderMotion.ScrollView>
      <Button title="Scroll to top" onPress={handleScrollToTop} />
    </HeaderMotion>
  );
}
```

Header Motion will use your ref internally instead of creating its own, so both your code and the library share the same ref without conflicts.

## Compatibility

The `animatedRef` prop works with all Header Motion scrollables — `ScrollView`, `FlatList`, and any custom scrollable created via `createHeaderMotionScrollable()`.

## What's next?

Learn how to use your own scroll handlers alongside Header Motion in [Consumer scroll handlers](./consumer-scroll-handlers).
