# Changelog

## 2.0.0-alpha.0

This is the first v2 alpha. It adds header presets, shared tabs, and native refresh state for custom indicators. The new Collapsible API is experimental and can change between alpha releases. Pin this exact version and test it in your app before you use it in production.

This version adds native code. Rebuild your app after the update. For iOS, run `pod install` before the build. Expo apps need a development build; Expo Go does not include the native refresh control.

When you move from v1, check your header stacking. Overlay headers now use `zIndex: 1` by default. Gesture Handler 2 remains supported, and this release adds Gesture Handler 3 support.

### Commits since v1.0.1

- Added Collapsible and CollapsibleTabs, header presets, pager adapters, and Collapse and Expand controls. ([a026c257](https://github.com/pawicao/react-native-header-motion/commit/a026c2579bc835ac27b5fa656e08384cd24928c4))
- Added native headless refresh control on iOS and Android, with useRefreshControl for custom indicators. ([7741a2e3](https://github.com/pawicao/react-native-header-motion/commit/7741a2e3a369bebb461c483c4afd40fbcc7c235e))
- Added Gesture Handler 3 support and kept Gesture Handler 2 support. ([cbc44634](https://github.com/pawicao/react-native-header-motion/commit/cbc44634b422d4298472e3c9fd1518aaae59b113))
- Fixed inline overlay headers appearing below scroll content. ([607ae5d0](https://github.com/pawicao/react-native-header-motion/commit/607ae5d0eafb087492a87ba6e4cfac82833d1b4e))
- Fixed header controls, reverse scrolling, state callbacks, initial styles, example types, and package contents. ([7ad8d2d8](https://github.com/pawicao/react-native-header-motion/commit/7ad8d2d8c49485ae16ac81014a1a699084370d27))
- Added separate stable v1 and Next documentation. ([65a24040](https://github.com/pawicao/react-native-header-motion/commit/65a24040c9d48d116a691d073c9563c452e98a6d))
- Updated the Next docs for the default header stacking order. ([197f27b3](https://github.com/pawicao/react-native-header-motion/commit/197f27b3dbcaa625e52dce4346aced0bd4b93564))
- Excluded temporary project files from Git. ([5b4ee5f2](https://github.com/pawicao/react-native-header-motion/commit/5b4ee5f2be3172436bb8c33271fce9e627056763))

### Known limits

Device QA used React Native 0.83.2 and Gesture Handler 3.2.1 on iOS 26.3 and Android API 37. Gesture Handler 2 passed CI checks but did not run on a device in this release check. The unconfirmed refresh timeout and full mounted-control handoff remain untested. One deep iOS animated collapse left a visible edge of about 0.33 points; its state callback reported collapsed.
