const mockUseHeaderMotionContextOrThrow = jest.fn();
const mockUseHeaderMotionBridge = jest.fn();
let capturedPanOnEnd: ((event: any) => void) | undefined;

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
    onEnd: (cb: (event: any) => void) => {
      capturedPanOnEnd = cb;
      return pan;
    },
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
import { Bridge } from '../Bridge';
import { Header } from '../Header';
import { HeaderDynamic } from '../HeaderDynamic';
import { NavigationBridge } from '../NavigationBridge';
import { HeaderPanBoundary } from '../HeaderPanBoundary';
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
  headerPanMomentumOffset: createSharedValue<number | null>(null),
  refreshControl: {
    progress: createSharedValue(0),
    rawProgress: createSharedValue(0),
    pullDistance: createSharedValue(0),
    triggerDistance: createSharedValue(80),
    phase: createSharedValue(0),
    overshoot: createSharedValue(0),
    isPulling: createSharedValue(false),
    isReady: createSharedValue(false),
    isRefreshing: createSharedValue(false),
    isSettling: createSharedValue(false),
    isActive: createSharedValue(false),
  },
  refreshControlOwner: createSharedValue<number | null>(null),
  scrollValues: createSharedValue({}),
  activeScrollId: undefined,
  scrollToRef: { current: jest.fn() },
  originalHeaderHeight: 0,
};

const layoutEvent = {
  nativeEvent: {
    layout: {
      height: 120,
    },
  },
} as any;

const headerOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
};

describe('Header components', () => {
  beforeEach(() => {
    mockUseHeaderMotionContextOrThrow.mockReset();
    mockUseHeaderMotionBridge.mockReset();
    capturedPanOnEnd = undefined;
    bridgeValue.measureTotalHeight.mockClear();
    bridgeValue.measureDynamic.mockClear();
    bridgeValue.headerPanMomentumOffset.set.mockClear();
  });

  it('HeaderMotion.Bridge requires a render function child', () => {
    expect(() =>
      Bridge({
        children: 'invalid' as any,
      })
    ).toThrow(
      'HeaderMotion.Bridge only accepts a render function as its child.'
    );
  });

  it('HeaderMotion.Bridge passes the bridge value to its child', () => {
    const children = jest.fn(() => 'ok');
    mockUseHeaderMotionBridge.mockReturnValue(bridgeValue);

    expect(Bridge({ children })).toBe('ok');
    expect(children).toHaveBeenCalledWith(bridgeValue);
  });

  it('HeaderMotion.NavigationBridge returns the main context provider', () => {
    const child = React.createElement('Child');
    const element = NavigationBridge({
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

    const element = Header({
      onLayout: userOnLayout,
      style: { opacity: 0.5 },
      children: React.createElement('Child'),
    } as any) as React.ReactElement<any>;
    const viewElement = element.props.children;

    expect(element.type).toBe(HeaderPanBoundary);
    expect(element.props.pannable).toBeUndefined();
    expect(element.props.panDecayConfig).toBeUndefined();
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

    const element = Header({
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

    const element = Header({
      asChild: true,
      children: React.createElement('Child', { onLayout: childOnLayout }),
    }) as React.ReactElement<any>;
    const child = element.props.children;

    child.props.onLayout(layoutEvent);
    expect(bridgeValue.measureTotalHeight).toHaveBeenCalledWith(layoutEvent);
    expect(childOnLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('HeaderMotion.Header forwards pan props to HeaderPanBoundary', () => {
    const panDecayConfig = { deceleration: 0.99 };
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    const element = Header({
      pannable: true,
      panDecayConfig,
      children: React.createElement('Child'),
    } as any) as React.ReactElement<any>;

    expect(element.props.pannable).toBe(true);
    expect(element.props.panDecayConfig).toBe(panDecayConfig);
  });

  it('HeaderMotion.Header rejects invalid asChild children', () => {
    mockUseHeaderMotionContextOrThrow.mockReturnValue(bridgeValue);

    expect(() =>
      Header({
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

    const element = HeaderDynamic({
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

    const element = HeaderDynamic({
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
      pannable: true,
      headerPanMomentumOffset: bridgeValue.headerPanMomentumOffset,
      scrollToRef: bridgeValue.scrollToRef,
      withGestureHandlerRootView: true,
    }) as React.ReactElement<any>;

    expect((element.type as any).name).toBe('GestureHandlerRootView');
    expect((element.props.children.type as any).name).toBe('GestureDetector');
  });

  it('HeaderPanBoundary uses object decay config for momentum', () => {
    const element = HeaderPanBoundary({
      children: React.createElement('Child'),
      pannable: true,
      panDecayConfig: { deceleration: 0.991 },
      headerPanMomentumOffset: bridgeValue.headerPanMomentumOffset,
      scrollToRef: bridgeValue.scrollToRef,
    }) as React.ReactElement<any>;

    expect(
      element.props.gesture ?? element.props.children?.props?.gesture ?? null
    ).not.toBeNull();
    expect(capturedPanOnEnd).toEqual(expect.any(Function));

    capturedPanOnEnd?.({ velocityY: 320 });

    expect(bridgeValue.headerPanMomentumOffset.set).toHaveBeenCalledTimes(2);
  });

  it('HeaderPanBoundary uses function decay config for momentum', () => {
    const panDecayConfig = jest.fn((event) => ({
      velocity: event.velocityY * 0.5,
      deceleration: 0.994,
    }));

    const element = HeaderPanBoundary({
      children: React.createElement('Child'),
      pannable: true,
      panDecayConfig,
      headerPanMomentumOffset: bridgeValue.headerPanMomentumOffset,
      scrollToRef: bridgeValue.scrollToRef,
    }) as React.ReactElement<any>;

    expect(
      element.props.gesture ?? element.props.children?.props?.gesture ?? null
    ).not.toBeNull();
    expect(capturedPanOnEnd).toEqual(expect.any(Function));

    capturedPanOnEnd?.({ velocityY: 240 });

    expect(panDecayConfig).toHaveBeenCalledWith({ velocityY: 240 });
    expect(bridgeValue.headerPanMomentumOffset.set).toHaveBeenCalledTimes(2);
  });
});
