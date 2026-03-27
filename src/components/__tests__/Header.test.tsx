const mockUseHeaderMotionContextOrThrow = jest.fn();
const mockUseHeaderMotionBridge = jest.fn();

jest.mock('react', () => {
  const ReactActual = jest.requireActual('react');

  return {
    ...ReactActual,
    useMemo: (factory: () => unknown) => factory(),
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

jest.mock('../../hooks/useHeaderMotionBridge', () => ({
  __esModule: true,
  useHeaderMotionBridge: (...args: any[]) => mockUseHeaderMotionBridge(...args),
}));

jest.mock('react-native-gesture-handler', () => {
  const ReactActual = jest.requireActual('react');
  const pan = {
    enabled: () => pan,
    onChange: () => pan,
    onEnd: () => pan,
    shouldCancelWhenOutside: () => pan,
  };

  return {
    __esModule: true,
    Gesture: {
      Pan: () => pan,
    },
    GestureDetector: ({ children, gesture }: any) =>
      ReactActual.createElement('GestureDetector', { gesture }, children),
    GestureHandlerRootView: ({ children }: any) =>
      ReactActual.createElement('GestureHandlerRootView', null, children),
  };
});

import React from 'react';
import {
  HeaderMotionBridge,
  HeaderMotionHeader,
  HeaderMotionHeaderDynamic,
  HeaderMotionNavigationBridge,
} from '../Header';
import { HeaderPanBoundary, headerOverlayStyle } from '../HeaderBase';
import { HeaderMotionContext } from '../../context';

function createSharedValue<T>(value: T) {
  return {
    get: jest.fn(() => value),
    set: jest.fn(),
    value,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    modify: jest.fn(),
  } as any;
}

const bridgeValue = {
  progress: createSharedValue(0),
  progressThreshold: createSharedValue(120),
  measureTotalHeight: jest.fn(),
  measureDynamic: jest.fn(),
  enableHeaderPan: true,
  headerPanMomentumOffset: createSharedValue<number | null>(null),
  scrollValues: createSharedValue({}),
  activeScrollId: undefined,
  scrollToRef: { current: jest.fn() },
  originalHeaderHeight: createSharedValue(0),
};

const layoutEvent = {
  nativeEvent: {
    layout: {
      height: 120,
    },
  },
} as any;

describe('Header components', () => {
  beforeEach(() => {
    mockUseHeaderMotionContextOrThrow.mockReset();
    mockUseHeaderMotionBridge.mockReset();
    bridgeValue.measureTotalHeight.mockClear();
    bridgeValue.measureDynamic.mockClear();
  });

  it('HeaderMotion.Bridge requires a render function child', () => {
    expect(() =>
      HeaderMotionBridge({
        children: 'invalid' as any,
      })
    ).toThrow(
      'HeaderMotion.Bridge only accepts a render function as its child.'
    );
  });

  it('HeaderMotion.Bridge passes the bridge value to its child', () => {
    const children = jest.fn(() => 'ok');
    mockUseHeaderMotionBridge.mockReturnValue(bridgeValue);

    expect(HeaderMotionBridge({ children })).toBe('ok');
    expect(children).toHaveBeenCalledWith(bridgeValue);
  });

  it('HeaderMotion.NavigationBridge returns the main context provider', () => {
    const child = React.createElement('Child');
    const element = HeaderMotionNavigationBridge({
      value: bridgeValue,
      children: child,
    }) as React.ReactElement<any>;

    expect(element.type).toBe(HeaderMotionContext.Provider);
    expect(element.props.value).toBe(bridgeValue);
    expect(element.props.children).toBe(child);
  });

  it('HeaderMotion.Header wires overlay styles and total-height measurement', () => {
    const userOnLayout = jest.fn();
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    const element = HeaderMotionHeader({
      onLayout: userOnLayout,
      style: { opacity: 0.5 },
      children: React.createElement('Child'),
    } as any) as React.ReactElement<any>;
    const viewElement = element.props.children;

    expect(element.type).toBe(HeaderPanBoundary);
    expect(viewElement.props.style).toEqual([
      headerOverlayStyle,
      { opacity: 0.5 },
    ]);

    viewElement.props.onLayout(layoutEvent);
    expect(bridgeValue.measureTotalHeight).toHaveBeenCalledWith(layoutEvent);
    expect(userOnLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('HeaderMotion.Header omits overlay styles when overlay is false', () => {
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    const element = HeaderMotionHeader({
      overlay: false,
      style: { opacity: 1 },
      children: React.createElement('Child'),
    } as any) as React.ReactElement<any>;

    expect(element.props.children.props.style).toEqual([
      undefined,
      { opacity: 1 },
    ]);
  });

  it('HeaderMotion.Header composes onLayout in asChild mode', () => {
    const childOnLayout = jest.fn();
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    const element = HeaderMotionHeader({
      asChild: true,
      children: React.createElement('Child', { onLayout: childOnLayout }),
    }) as React.ReactElement<any>;
    const child = element.props.children;

    child.props.onLayout(layoutEvent);
    expect(bridgeValue.measureTotalHeight).toHaveBeenCalledWith(layoutEvent);
    expect(childOnLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('HeaderMotion.Header rejects invalid asChild children', () => {
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    expect(() =>
      HeaderMotionHeader({
        asChild: true,
        children: React.createElement(React.Fragment, null),
      })
    ).toThrow(
      'HeaderMotion.Header with `asChild` expects a single valid React element child that accepts `onLayout`.'
    );
  });

  it('HeaderMotion.Header.Dynamic composes onLayout', () => {
    const userOnLayout = jest.fn();
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    const element = HeaderMotionHeaderDynamic({
      onLayout: userOnLayout,
      children: React.createElement('Child'),
    } as any) as React.ReactElement<any>;

    element.props.onLayout(layoutEvent);
    expect(bridgeValue.measureDynamic).toHaveBeenCalledWith(layoutEvent);
    expect(userOnLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('HeaderMotion.Header.Dynamic composes onLayout in asChild mode', () => {
    const childOnLayout = jest.fn();
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    const element = HeaderMotionHeaderDynamic({
      asChild: true,
      children: React.createElement('Child', { onLayout: childOnLayout }),
    }) as React.ReactElement<any>;

    element.props.onLayout(layoutEvent);
    expect(bridgeValue.measureDynamic).toHaveBeenCalledWith(layoutEvent);
    expect(childOnLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('HeaderPanBoundary wraps with GestureHandlerRootView when requested', () => {
    const child = React.createElement('Child');

    const element = HeaderPanBoundary({
      children: child,
      enableHeaderPan: true,
      headerPanMomentumOffset: bridgeValue.headerPanMomentumOffset,
      scrollToRef: bridgeValue.scrollToRef,
      withGestureHandlerRootView: true,
    }) as React.ReactElement<any>;

    expect((element.type as any).name).toBe('GestureHandlerRootView');
    expect((element.props.children.type as any).name).toBe('GestureDetector');
  });
});
