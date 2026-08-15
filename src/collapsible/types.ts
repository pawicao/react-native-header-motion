import type { ViewStyle } from 'react-native';

/**
 * Snapshot of the motion state a collapsible preset is evaluated against.
 *
 * The object is intentionally open-ended: future versions may extend it with
 * additional state (for example pull-to-refresh progress once the headless
 * refresh control lands) without breaking existing presets. Presets should
 * read the fields they need and ignore the rest.
 */
export interface CollapsiblePresetContext {
  /**
   * Current header-motion progress, usually in the `0..1` range where `0` is
   * fully expanded and `1` is fully collapsed.
   */
  progress: number;
  /**
   * Pixel distance that maps `progress` from `0` to `1`. This is the measured
   * height of `Collapsible.Dynamic` unless overridden via `progressThreshold`.
   */
  progressThreshold: number;
}

/**
 * Styles a preset produces for each part of a collapsible header.
 *
 * All keys are optional — a preset only describes the parts it wants to
 * animate. When multiple presets are combined, their part styles are merged:
 * `transform` arrays are concatenated, numeric `opacity` values are
 * multiplied, and any other property is taken from the last preset that
 * defines it.
 */
export interface CollapsiblePresetPartStyles {
  /**
   * Style for the header container (`Collapsible.Header`), merged on top of
   * its intrinsic slide-up transform.
   */
  header?: ViewStyle;
  /**
   * Style for pinned sections (`Collapsible.Pinned`), merged on top of their
   * intrinsic counter-translate transform.
   */
  pinned?: ViewStyle;
  /**
   * Style for the measured collapsing wrapper (`Collapsible.Dynamic`). Use
   * transforms only — this element's layout defines the collapse distance.
   */
  dynamic?: ViewStyle;
  /**
   * Style for the content inside `Collapsible.Dynamic`. This is where most
   * visual effects (fade, parallax, scale) belong.
   */
  dynamicContent?: ViewStyle;
}

/**
 * A collapsible preset: a worklet mapping the current motion state to styles
 * for the collapsible header parts.
 *
 * Custom presets **must be marked with the `'worklet'` directive** — they run
 * on the UI thread inside the parts' animated styles.
 */
export type CollapsiblePreset = (
  context: CollapsiblePresetContext
) => CollapsiblePresetPartStyles;

/** Names of the built-in collapsible presets. */
export type CollapsiblePresetName =
  | 'collapse'
  | 'fade'
  | 'parallax'
  | 'scale'
  | 'none';

/**
 * Anything accepted by the `preset` prop: a built-in preset name, a configured
 * or custom preset function, or an array of those to combine.
 */
export type CollapsiblePresetInput =
  | CollapsiblePresetName
  | CollapsiblePreset
  | readonly (CollapsiblePresetName | CollapsiblePreset)[];

/** Terminal states reported by `Collapsible`'s `onStateChange`. */
export type CollapsibleHeaderState = 'expanded' | 'collapsed';
