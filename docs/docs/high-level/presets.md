---
sidebar_position: 2
title: Presets
---

# Presets

:::caution Alpha
This API is in alpha. It can change in any release, including patch releases. Pin the exact version. [Issue #31](https://github.com/pawicao/react-native-header-motion/issues/31) lists the changes we plan.
:::

A preset sets how the collapsing content of a [`Collapsible`](./collapsible) header moves. The parts always do their base movement: the frame moves up, and pinned content stays in place. A preset only adds styles on top of that base movement, so you can use more than one preset at a time.

## Built-in presets

To use the default options, give the preset name. To change the options, call the function from `CollapsiblePresets`:

```tsx
import { Collapsible, CollapsiblePresets } from 'react-native-header-motion';

<Collapsible preset="collapse">                                       // default options
<Collapsible preset={CollapsiblePresets.parallax({ factor: 0.3 })}>  // custom options
```

| Preset     | Effect                                                                        | Options                                           |
| ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `collapse` | Content moves up and goes under the pinned content, like the iOS large title. | —                                                 |
| `fade`     | Content fades out in place while the header collapses.                        | `from` (default `0`), `to` (default `0.8`)        |
| `parallax` | Content moves more slowly than the header and fades out.                      | `factor` (default `0.5`), `fade` (default `true`) |
| `scale`    | Content becomes smaller and fades out.                                        | `to` (default `0.9`), `fade` (default `true`)     |
| `none`     | No effect on the content. The header still moves up.                          | —                                                 |

## Use more than one preset

Give an array of presets. The presets merge with these rules:

- `transform` arrays join in array order. Thus, the order of the presets can change the result.
- Number `opacity` values multiply.
- For all other properties, the last preset that sets the property wins.

```tsx
<Collapsible preset={['collapse', CollapsiblePresets.fade({ to: 0.5 })]}>
```

:::note
`parallax` and `scale` fade the content by default. If you use both, the content fades two times. To prevent this, set `fade: false` on one of them.
:::

## Custom presets

A preset is a worklet. It gets the motion state and returns styles for each part. Make one with `createCollapsiblePreset()`. The function runs on the UI thread, so it **must have the `'worklet'` directive**:

```tsx
import { createCollapsiblePreset } from 'react-native-header-motion';

const lift = createCollapsiblePreset(({ progress, progressThreshold }) => {
  'worklet';
  return {
    header: { borderBottomWidth: progress },
    dynamicContent: {
      opacity: 1 - progress,
      transform: [{ translateY: -progress * progressThreshold * 0.25 }],
    },
  };
});

<Collapsible preset={lift}>
```

The returned object can have styles for four parts:

| Key              | Part                                          | Merges on top of                 |
| ---------------- | --------------------------------------------- | -------------------------------- |
| `header`         | The `Collapsible.Header` frame                | The base upward movement         |
| `pinned`         | All `Collapsible.Pinned` parts                | The base downward movement       |
| `dynamic`        | The measured `Collapsible.Dynamic` wrapper    | Its default `overflow: 'hidden'` |
| `dynamicContent` | The content view inside `Collapsible.Dynamic` | —                                |

On `dynamic`, use only transforms. The layout of `dynamic` sets the collapse distance, and transforms do not change the layout.

Define presets and preset arrays outside the component, or memoize them. If you make a new preset or array on each render, the animated styles also build again on each render.

:::note
The preset context (`{ progress, progressThreshold }`) does not include the refresh state yet. To animate the header during pull to refresh, use `useRefreshControl()` in a header component. Later versions can add more fields to the context, so read only the fields that you need.
:::
