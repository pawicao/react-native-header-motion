import {
  CollapsiblePresets,
  createCollapsiblePreset,
  mergeCollapsiblePartStyles,
  resolveCollapsiblePartStyle,
  resolveCollapsiblePresets,
} from '../presets';
import type { CollapsiblePreset, CollapsiblePresetContext } from '../types';

const context = (
  progress: number,
  progressThreshold = 100
): CollapsiblePresetContext => ({ progress, progressThreshold });

describe('CollapsiblePresets', () => {
  it('collapse counter-translates the wrapper and slides the content up', () => {
    const preset = CollapsiblePresets.collapse();

    expect(preset(context(0.5))).toEqual({
      dynamic: { transform: [{ translateY: 50 }] },
      dynamicContent: { transform: [{ translateY: -50 }] },
    });
    expect(preset(context(0))).toEqual({
      dynamic: { transform: [{ translateY: 0 }] },
      dynamicContent: { transform: [{ translateY: -0 }] },
    });
  });

  it('fade maps progress onto opacity over its range', () => {
    const preset = CollapsiblePresets.fade();

    expect(preset(context(0)).dynamicContent).toEqual({ opacity: 1 });
    expect(preset(context(0.4)).dynamicContent).toEqual({ opacity: 0.5 });
    expect(preset(context(0.8)).dynamicContent).toEqual({ opacity: 0 });
    expect(preset(context(1)).dynamicContent).toEqual({ opacity: 0 });
  });

  it('fade respects a custom range', () => {
    const preset = CollapsiblePresets.fade({ from: 0.2, to: 0.7 });

    expect(preset(context(0.2)).dynamicContent).toEqual({ opacity: 1 });
    expect(preset(context(0.45)).dynamicContent!.opacity).toBeCloseTo(0.5);
    expect(preset(context(0.7)).dynamicContent).toEqual({ opacity: 0 });
  });

  it('parallax lags the content by the configured factor', () => {
    const preset = CollapsiblePresets.parallax({ factor: 0.25, fade: false });

    expect(preset(context(0.8, 200)).dynamicContent).toEqual({
      transform: [{ translateY: 40 }],
    });
  });

  it('parallax fades by default', () => {
    const preset = CollapsiblePresets.parallax();
    const styles = preset(context(0.8)).dynamicContent!;

    expect(styles.transform).toEqual([{ translateY: 40 }]);
    expect(styles.opacity).toBe(0);
  });

  it('scale shrinks toward the configured end scale', () => {
    const preset = CollapsiblePresets.scale({ to: 0.5, fade: false });

    expect(preset(context(1)).dynamicContent).toEqual({
      transform: [{ scale: 0.5 }],
    });
    expect(preset(context(0)).dynamicContent).toEqual({
      transform: [{ scale: 1 }],
    });
  });

  it('none produces no styles', () => {
    expect(CollapsiblePresets.none()(context(0.5))).toEqual({});
  });
});

describe('createCollapsiblePreset', () => {
  it('returns the preset unchanged', () => {
    const preset: CollapsiblePreset = () => ({});
    expect(createCollapsiblePreset(preset)).toBe(preset);
  });
});

describe('resolveCollapsiblePresets', () => {
  it('resolves built-in names with default options', () => {
    const [preset] = resolveCollapsiblePresets('fade');
    expect(preset!(context(0.8)).dynamicContent).toEqual({ opacity: 0 });
  });

  it('keeps preset functions as-is and supports mixed arrays', () => {
    const custom: CollapsiblePreset = () => ({ header: { opacity: 0.5 } });
    const resolved = resolveCollapsiblePresets(['collapse', custom]);

    expect(resolved).toHaveLength(2);
    expect(resolved[1]).toBe(custom);
    expect(resolved[0]!(context(1)).dynamic).toEqual({
      transform: [{ translateY: 100 }],
    });
  });

  it('throws on unknown preset names', () => {
    expect(() =>
      resolveCollapsiblePresets('spin' as unknown as 'collapse')
    ).toThrow('Unknown collapsible preset "spin"');
  });
});

describe('mergeCollapsiblePartStyles', () => {
  it('concatenates transforms in order', () => {
    expect(
      mergeCollapsiblePartStyles([
        { transform: [{ translateY: 10 }] },
        undefined,
        { transform: [{ scale: 0.5 }] },
      ])
    ).toEqual({
      transform: [{ translateY: 10 }, { scale: 0.5 }],
    });
  });

  it('multiplies numeric opacities', () => {
    expect(
      mergeCollapsiblePartStyles([{ opacity: 0.5 }, { opacity: 0.5 }])
    ).toEqual({ opacity: 0.25 });
  });

  it('lets the last style win for other properties', () => {
    expect(
      mergeCollapsiblePartStyles([
        { backgroundColor: 'red', borderTopWidth: 1 },
        { backgroundColor: 'blue' },
      ])
    ).toEqual({ backgroundColor: 'blue', borderTopWidth: 1 });
  });

  it('omits transform and opacity keys when no style defines them', () => {
    expect(mergeCollapsiblePartStyles([{ borderTopWidth: 2 }])).toEqual({
      borderTopWidth: 2,
    });
  });
});

describe('resolveCollapsiblePartStyle', () => {
  it('merges the intrinsic style with every preset result for the part', () => {
    const presets = resolveCollapsiblePresets([
      'collapse',
      CollapsiblePresets.fade(),
    ]);

    expect(
      resolveCollapsiblePartStyle(
        'dynamicContent',
        { transform: [{ translateX: 5 }] },
        presets,
        context(0.4)
      )
    ).toEqual({
      transform: [{ translateX: 5 }, { translateY: -40 }],
      opacity: 0.5,
    });
  });

  it('returns only the intrinsic style when presets skip the part', () => {
    const presets = resolveCollapsiblePresets('none');

    expect(
      resolveCollapsiblePartStyle(
        'header',
        { transform: [{ translateY: -40 }] },
        presets,
        context(0.4)
      )
    ).toEqual({ transform: [{ translateY: -40 }] });
  });
});
