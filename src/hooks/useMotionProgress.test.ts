const mockUseHeaderMotionContextOrThrow = jest.fn();

jest.mock('../context', () => ({
  __esModule: true,
  useHeaderMotionContextOrThrow: (...args: any[]) =>
    mockUseHeaderMotionContextOrThrow(...args),
}));

import { useHeaderMotionBridge } from './useHeaderMotionBridge';
import { useMotionProgress } from './useMotionProgress';

function createSharedValue<T>(value: T) {
  return {
    get: jest.fn(() => value),
    set: jest.fn(),
    value,
  };
}

const bridgeValue = {
  progress: createSharedValue(0),
  progressThreshold: createSharedValue(120),
  measureTotalHeight: jest.fn(),
  measureDynamic: jest.fn(),
  headerPanMomentumOffset: createSharedValue<number | null>(null),
  scrollValues: createSharedValue({}),
  activeScrollId: undefined,
  scrollToRef: { current: null },
  originalHeaderHeight: 0,
};

describe('motion hooks', () => {
  beforeEach(() => {
    mockUseHeaderMotionContextOrThrow.mockReset();
  });

  it('useMotionProgress returns only progress and progressThreshold', () => {
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    expect(useMotionProgress()).toEqual({
      progress: bridgeValue.progress,
      progressThreshold: bridgeValue.progressThreshold,
    });
    expect(mockUseHeaderMotionContextOrThrow).toHaveBeenCalledWith(
      'useMotionProgress must be used within <HeaderMotion /> or <HeaderMotion.NavigationBridge />. If you are rendering inside a navigation header, bridge the context with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
    );
  });

  it('useHeaderMotionBridge returns the full bridge value', () => {
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    expect(useHeaderMotionBridge()).toBe(bridgeValue);
    expect(mockUseHeaderMotionContextOrThrow).toHaveBeenCalledWith(
      'useHeaderMotionBridge must be used within <HeaderMotion />. Use it only when bridging context into a separate subtree with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
    );
  });

  it('rethrows missing-context errors from the helper hook', () => {
    const error = new Error('missing context');
    mockUseHeaderMotionContextOrThrow.mockImplementation(() => {
      throw error;
    });

    expect(() => useMotionProgress()).toThrow(error);
    expect(() => useHeaderMotionBridge()).toThrow(error);
  });
});
