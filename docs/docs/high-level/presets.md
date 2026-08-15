---
sidebar_position: 2
title: Presets
---

# Presets

A preset describes how the collapsing content of a [`Collapsible`](./collapsible) header animates. The structural choreography — the frame sliding up, pinned content counter-translating — is intrinsic to the parts; presets only decorate the collapsing section, which is what makes them freely composable.

## Built-in presets

Pass a name for the defaults, or call the factory from `CollapsiblePresets` to configure:

```tsx
import { Collapsible, CollapsiblePresets } from 'react-native-header-motion';

<Collapsible preset="collapse">            // string shorthand
<Collapsible preset={CollapsiblePresets.parallax({ factor: 0.3 })}>  // configured
```

| Preset     | Effect                                                                                          | Options                                     |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `collapse` | Content slides up and is clipped under the pinned sections (the classic iOS large-title feel).   | —                                           |
| `fade`     | Content fades out in place while the header collapses.                                          | `from` (default `0`), `to` (default `0.8`)  |
| `parallax` | Content lags behind the collapse and fades out.                                                 | `factor` (default `0.5`), `fade` (default `true`) |
| `scale`    | Content shrinks and fades out.                                                                  | `to` (default `0.9`), `fade` (default `true`) |
| `none`     | No content effect; the header still slides up.                                                  | —                                           |

## Combining presets

Pass an array to combine effects. `transform` arrays concatenate in order, numeric `opacity` values multiply, and any other property is taken from the last preset that defines it:

```tsx
<Collapsible preset={['collapse', CollapsiblePresets.fade({ to: 0.5 })]}>
```

## Custom presets

A preset is a worklet from the current motion state to per-part styles. Author one with `createCollapsiblePreset()` — the function runs on the UI thread, so it **must carry the `'worklet'` directive**:

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

The returned object may style four parts:

| Key              | Applied to                                    | Merged on top of                     |
| ---------------- | --------------------------------------------- | ------------------------------------ |
| `header`         | `Collapsible.Header` frame                    | The intrinsic slide-up transform     |
| `pinned`         | Every `Collapsible.Pinned`                    | The intrinsic counter-translate      |
| `dynamic`        | The measured `Collapsible.Dynamic` wrapper    | Its default `overflow: 'hidden'`     |
| `dynamicContent` | The content view inside `Collapsible.Dynamic` | —                                    |

Use transforms only on `dynamic` — its layout defines the collapse distance, and transforms don't affect layout measurement.

Because presets are plain values, they are shareable: hoist them to module scope (or memoize) so the animated styles aren't rebuilt on every render, and publish the ones you're proud of.

:::note Designed to grow
The preset context (`{ progress, progressThreshold }`) is intentionally open-ended. When the headless refresh control lands, refresh state will join it, letting presets react to pull-to-refresh without any breaking change. Read the fields you need and ignore the rest.
:::
