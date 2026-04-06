# React Native Header Motion

Scroll-driven animated headers for React Native.

React Native Header Motion gives you the plumbing for collapsible, progress-driven headers without forcing a prebuilt UI on you. It measures the header, derives a shared `progress` value, keeps multiple scrollables in sync, and bridges that state into navigation-rendered headers when needed.

Built on top of:

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [React Native Worklets](https://docs.swmansion.com/react-native-worklets/docs/)

<div align="center">
  <img src="https://github.com/user-attachments/assets/b673349a-f26a-4cc8-bfe1-60d77deb4390" width="70%" />
</div>

## Documentation

Full documentation lives here:

- [Docs home](https://pawicao.github.io/react-native-header-motion/)
- [Overview](https://pawicao.github.io/react-native-header-motion/docs/overview)
- [Installation](https://pawicao.github.io/react-native-header-motion/docs/installation)
- [Quick Start](https://pawicao.github.io/react-native-header-motion/docs/quick-start)
- [Guides](https://pawicao.github.io/react-native-header-motion/docs/guides/dynamic-header-measurement)
- [API Reference](https://pawicao.github.io/react-native-header-motion/docs/api/header-motion)

## What it helps with

- Scroll-driven animated headers
- Shared header state across tabs, pagers, and multiple scrollables
- Navigation-rendered headers in Expo Router or React Navigation
- Custom scrollables via `createHeaderMotionScrollable()` and `ScrollablePresets`
- Optional header panning

## What it is not

- A fully styled header component
- A page layout framework
- A general-purpose animation abstraction on top of Reanimated

## Installation

```bash
npm install react-native-header-motion
```

Peer dependencies:

- `react-native-reanimated@^4.0.0`
- `react-native-gesture-handler@^2.0.0`
- `react-native-worklets@>=0.4.0`

Then complete the standard setup for:

- [Reanimated and Worklets](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation)
- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)

For other package managers and full setup notes, see the [installation guide](https://pawicao.github.io/react-native-header-motion/docs/installation).

## Quick example

```tsx
import HeaderMotion from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { View } from 'react-native';

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
  return (
    <HeaderMotion.Header>
      <HeaderMotion.Header.Dynamic>
        <View>{/* collapsible content */}</View>
      </HeaderMotion.Header.Dynamic>

      <View>{/* sticky content */}</View>
    </HeaderMotion.Header>
  );
}
```

In a real header, use `useMotionProgress()` to drive your Reanimated styles. See the [Quick Start](https://pawicao.github.io/react-native-header-motion/docs/quick-start) for the full walkthrough, animation examples, and styling details.

## Version notes

- Upgrading from `v0.3.x`? Read [MIGRATION-v1.md](./MIGRATION-v1.md).
- Need the old API docs? See the [README on branch `v0`](https://github.com/pawicao/react-native-header-motion/blob/v0/README.md).

## Example app

The repository includes an Expo Router example app covering simple headers, navigation bridging, shared headers across pages, custom scrollables, overscroll, pull to refresh, and more.

See:

- [`example/`](./example/)
- [Example app docs](https://pawicao.github.io/react-native-header-motion/docs/other/example-app)

## Contributing

- [Contributing guide](./CONTRIBUTING.md)
- [Code of conduct](./CODE_OF_CONDUCT.md)

## License

MIT

Made with [`create-react-native-library`](https://github.com/callstack/react-native-builder-bob)
