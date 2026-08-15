import type { ViewStyle } from 'react-native';
import type {
  CollapsiblePreset,
  CollapsiblePresetContext,
  CollapsiblePresetInput,
  CollapsiblePresetName,
  CollapsiblePresetPartStyles,
} from './types';

function clamp01(value: number): number {
  'worklet';
  return Math.min(1, Math.max(0, value));
}

function rangeProgress(progress: number, from: number, to: number): number {
  'worklet';
  if (to <= from) {
    return progress >= to ? 1 : 0;
  }

  return clamp01((progress - from) / (to - from));
}

/**
 * Identity helper for authoring custom collapsible presets with full typing.
 *
 * The preset function runs on the UI thread inside the collapsible parts'
 * animated styles, so it **must be marked with the `'worklet'` directive**.
 *
 * @example
 * ```ts
 * const myPreset = createCollapsiblePreset(({ progress, progressThreshold }) => {
 *   'worklet';
 *   return {
 *     dynamicContent: { opacity: 1 - progress },
 *     header: { borderBottomWidth: progress },
 *   };
 * });
 * ```
 */
export function createCollapsiblePreset(
  preset: CollapsiblePreset
): CollapsiblePreset {
  return preset;
}

export interface CollapsibleFadeOptions {
  /**
   * Progress value at which the fade starts.
   *
   * @default 0
   */
  from?: number;
  /**
   * Progress value at which the content is fully transparent.
   *
   * @default 0.8
   */
  to?: number;
}

export interface CollapsibleParallaxOptions {
  /**
   * Fraction of the collapse distance the content lags behind by. `0` moves
   * the content 1:1 with the header, `1` keeps it visually still.
   *
   * @default 0.5
   */
  factor?: number;
  /**
   * Also fades the content out while it collapses.
   *
   * @default true
   */
  fade?: boolean;
}

export interface CollapsibleScaleOptions {
  /**
   * Scale of the content in the fully collapsed state.
   *
   * @default 0.9
   */
  to?: number;
  /**
   * Also fades the content out while it collapses.
   *
   * @default true
   */
  fade?: boolean;
}

const collapse = (): CollapsiblePreset => {
  return (context: CollapsiblePresetContext) => {
    'worklet';
    const offset = context.progress * context.progressThreshold;

    return {
      dynamic: { transform: [{ translateY: offset }] },
      dynamicContent: { transform: [{ translateY: -offset }] },
    };
  };
};

const fade = ({
  from = 0,
  to = 0.8,
}: CollapsibleFadeOptions = {}): CollapsiblePreset => {
  return (context: CollapsiblePresetContext) => {
    'worklet';

    return {
      dynamicContent: {
        opacity: 1 - rangeProgress(context.progress, from, to),
      },
    };
  };
};

const parallax = ({
  factor = 0.5,
  fade: withFade = true,
}: CollapsibleParallaxOptions = {}): CollapsiblePreset => {
  return (context: CollapsiblePresetContext) => {
    'worklet';
    const transform = [
      { translateY: context.progress * context.progressThreshold * factor },
    ];
    const dynamicContent: ViewStyle = withFade
      ? { transform, opacity: 1 - rangeProgress(context.progress, 0, 0.8) }
      : { transform };

    return { dynamicContent };
  };
};

const scale = ({
  to = 0.9,
  fade: withFade = true,
}: CollapsibleScaleOptions = {}): CollapsiblePreset => {
  return (context: CollapsiblePresetContext) => {
    'worklet';
    const transform = [{ scale: 1 - (1 - to) * context.progress }];
    const dynamicContent: ViewStyle = withFade
      ? { transform, opacity: 1 - rangeProgress(context.progress, 0, 0.8) }
      : { transform };

    return { dynamicContent };
  };
};

const none = (): CollapsiblePreset => {
  return () => {
    'worklet';
    return {};
  };
};

/**
 * Built-in collapsible presets as configurable factories.
 *
 * Every factory returns a `CollapsiblePreset` you can pass to the `preset`
 * prop, alone or in an array to combine effects:
 *
 * ```tsx
 * <Collapsible preset={CollapsiblePresets.parallax({ factor: 0.3 })}>
 * <Collapsible preset={['collapse', CollapsiblePresets.fade({ to: 0.5 })]}>
 * ```
 *
 * The string shorthands (`preset="parallax"`) resolve to these factories with
 * their default options.
 *
 * - `collapse` — content slides up and is clipped under the pinned sections
 *   (the classic iOS large-title behavior).
 * - `fade` — content fades out in place while the header collapses.
 * - `parallax` — content lags behind the collapse and fades out.
 * - `scale` — content shrinks and fades out.
 * - `none` — no content effect; the header still slides up.
 */
export const CollapsiblePresets = {
  collapse,
  fade,
  parallax,
  scale,
  none,
};

const BUILT_IN_PRESETS: Record<CollapsiblePresetName, () => CollapsiblePreset> =
  CollapsiblePresets;

/**
 * Normalizes a `preset` prop value into a flat list of preset functions,
 * resolving built-in names to their default-configured factories.
 */
export function resolveCollapsiblePresets(
  input: CollapsiblePresetInput
): readonly CollapsiblePreset[] {
  const items = Array.isArray(input) ? input : [input];

  return (items as readonly (CollapsiblePresetName | CollapsiblePreset)[]).map(
    (item) => {
      if (typeof item !== 'string') {
        return item;
      }

      const factory = BUILT_IN_PRESETS[item];
      if (!factory) {
        throw new Error(
          `[react-native-header-motion] Unknown collapsible preset "${item}". ` +
            `Available presets: ${Object.keys(BUILT_IN_PRESETS).join(', ')}.`
        );
      }

      return factory();
    }
  );
}

/**
 * Merges part styles coming from multiple presets into one style object.
 *
 * `transform` arrays are concatenated in order, numeric `opacity` values are
 * multiplied, and every other property is taken from the last style that
 * defines it.
 */
export function mergeCollapsiblePartStyles(
  styles: readonly (ViewStyle | undefined)[]
): ViewStyle {
  'worklet';
  const result: Record<string, unknown> = {};
  let transform: unknown[] | null = null;
  let opacity: number | null = null;

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i] as Record<string, unknown> | undefined;
    if (!style) {
      continue;
    }

    for (const key in style) {
      const value = style[key];
      if (key === 'transform' && Array.isArray(value)) {
        transform = transform ? transform.concat(value) : value.slice();
      } else if (key === 'opacity' && typeof value === 'number') {
        opacity = opacity === null ? value : opacity * value;
      } else {
        result[key] = value;
      }
    }
  }

  if (transform) {
    result.transform = transform;
  }
  if (opacity !== null) {
    result.opacity = opacity;
  }

  return result as ViewStyle;
}

/**
 * Evaluates every preset for one header part and merges the results on top of
 * the part's intrinsic style.
 */
export function resolveCollapsiblePartStyle(
  part: keyof CollapsiblePresetPartStyles,
  intrinsic: ViewStyle | undefined,
  presets: readonly CollapsiblePreset[],
  context: CollapsiblePresetContext
): ViewStyle {
  'worklet';
  const collected: (ViewStyle | undefined)[] = [intrinsic];

  for (let i = 0; i < presets.length; i++) {
    collected.push(presets[i]!(context)[part]);
  }

  return mergeCollapsiblePartStyles(collected);
}
