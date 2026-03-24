import { resolveHeaderOffsetStyle } from '../headerOffsetStyle';

describe('resolveHeaderOffsetStyle', () => {
  it('uses paddingTop by default', () => {
    expect(resolveHeaderOffsetStyle(48)).toEqual({ paddingTop: 48 });
  });

  it('uses marginTop for margin strategy', () => {
    expect(resolveHeaderOffsetStyle(48, 'margin')).toEqual({ marginTop: 48 });
  });

  it('uses top with bottom compensation for top strategy', () => {
    expect(resolveHeaderOffsetStyle(48, 'top')).toEqual({
      top: 48,
      paddingBottom: 48,
    });
  });

  it('uses translateY with bottom compensation for translate strategy', () => {
    expect(resolveHeaderOffsetStyle(48, 'translate')).toEqual({
      transform: [{ translateY: 48 }],
      paddingBottom: 48,
    });
  });

  it('returns no extra style for none strategy', () => {
    expect(resolveHeaderOffsetStyle(48, 'none')).toBeUndefined();
  });
});
