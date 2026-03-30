---
sidebar_position: 2
title: Installation
description: How to install React Native Header Motion and its peer dependencies.
---

# Installation

## Install the library

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="npm" label="npm">

```bash
npm install react-native-header-motion
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn add react-native-header-motion
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add react-native-header-motion
```

</TabItem>
<TabItem value="bun" label="bun">

```bash
bun add react-native-header-motion
```

</TabItem>
</Tabs>

## Peer dependencies

Header Motion relies on three peer dependencies that your project must provide:

| Package                        | Required version |
| ------------------------------ | ---------------- |
| `react-native-reanimated`      | `^4.0.0`         |
| `react-native-gesture-handler` | `^2.0.0`         |
| `react-native-worklets`        | `>= 0.4.0`       |

If you already have these installed, you're good to go. Otherwise, follow their respective installation guides:

- [Reanimated & Worklets installation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation)
- [Gesture Handler installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)

:::caution
Make sure the version of `react-native-worklets` you install is compatible with your version of Reanimated. Check the [compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility) before installing.
:::

## Version notes

- If you are upgrading from `v0.3.x`, read the [Migration from v0](./other/migration-from-v0) guide.
- For the old `v0` docs, see the [README on the v0 branch](https://github.com/pawicao/react-native-header-motion/blob/v0/README.md).

## What's next?

With everything installed, head to the [Quick Start](./quick-start) to build your first animated header.
