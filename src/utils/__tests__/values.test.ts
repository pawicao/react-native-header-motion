import { getInitialScrollValue } from '../values';

describe('getInitialScrollValue', () => {
  it('should return { min: 0, current: 0 }', () => {
    const result = getInitialScrollValue();
    expect(result).toEqual({ min: 0, current: 0 });
  });
});
