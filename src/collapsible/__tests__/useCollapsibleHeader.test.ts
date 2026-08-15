const mockUseHeaderMotionContextOrThrow = jest.fn();

jest.mock('react', () => {
  const ReactActual = jest.requireActual('react');

  return {
    ...ReactActual,
    useMemo: (factory: () => unknown) => factory(),
    useCallback: (callback: unknown) => callback,
  };
});

jest.mock('../../context', () => {
  const actual = jest.requireActual('../../context');

  return {
    __esModule: true,
    ...actual,
    useHeaderMotionContextOrThrow: (...args: any[]) =>
      mockUseHeaderMotionContextOrThrow(...args),
  };
});

import { useCollapsibleHeader } from '../useCollapsibleHeader';

const worklets = require('react-native-worklets');

function createSharedValue<T>(value: T) {
  return {
    get: jest.fn(() => value),
    set: jest.fn(),
    value,
  } as any;
}

describe('useCollapsibleHeader', () => {
  let scheduleOnUISpy: jest.SpyInstance;

  beforeAll(() => {
    scheduleOnUISpy = jest
      .spyOn(worklets, 'scheduleOnUI')
      .mockImplementation((worklet: any, ...args: any[]) => worklet(...args));
  });

  afterAll(() => {
    scheduleOnUISpy.mockRestore();
  });

  beforeEach(() => {
    mockUseHeaderMotionContextOrThrow.mockReset();
    scheduleOnUISpy.mockClear();
  });

  function createContext({
    scrollValues = { feed: { min: 20, current: 60 } },
    activeScrollId,
    scrollTo = jest.fn(),
  }: {
    scrollValues?: Record<string, { min: number; current: number }>;
    activeScrollId?: any;
    scrollTo?: jest.Mock | null;
  } = {}) {
    const ctxValue = {
      progress: createSharedValue(0.5),
      progressThreshold: createSharedValue(100),
      scrollValues: createSharedValue(scrollValues),
      activeScrollId,
      scrollToRef: { current: scrollTo },
    };
    mockUseHeaderMotionContextOrThrow.mockReturnValue(ctxValue);
    return { ctxValue, scrollTo };
  }

  it('collapse scrolls the resolved scrollable to the collapsed offset', () => {
    const { scrollTo } = createContext();

    useCollapsibleHeader().collapse();

    expect(scrollTo).toHaveBeenCalledWith(120, {
      isValueDelta: false,
      animated: true,
    });
  });

  it('expand scrolls back to the scrollable minimum', () => {
    const { scrollTo } = createContext();

    useCollapsibleHeader().expand({ animated: false });

    expect(scrollTo).toHaveBeenCalledWith(20, {
      isValueDelta: false,
      animated: false,
    });
  });

  it('targets the active scrollable in multi-scroll setups', () => {
    const { scrollTo } = createContext({
      scrollValues: {
        a: { min: 0, current: 0 },
        b: { min: 5, current: 40 },
      },
      activeScrollId: createSharedValue('b'),
    });

    useCollapsibleHeader().collapse();

    expect(scrollTo).toHaveBeenCalledWith(105, {
      isValueDelta: false,
      animated: true,
    });
  });

  it('does nothing when no scrollable is connected yet', () => {
    createContext({ scrollTo: null });

    expect(() => useCollapsibleHeader().collapse()).not.toThrow();
    expect(scheduleOnUISpy).not.toHaveBeenCalled();
  });

  it('exposes the motion progress values', () => {
    const { ctxValue } = createContext();

    const result = useCollapsibleHeader();

    expect(result.progress).toBe(ctxValue.progress);
    expect(result.progressThreshold).toBe(ctxValue.progressThreshold);
  });
});
