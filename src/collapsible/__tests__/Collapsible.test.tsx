const mockUseCollapsiblePresetsOrThrow = jest.fn();
const mockUseMotionProgress = jest.fn();
const mockUseHeaderMotionBridge = jest.fn();
const mockUseContext = jest.fn();

jest.mock('react', () => {
  const ReactActual = jest.requireActual('react');

  return {
    ...ReactActual,
    useMemo: (factory: () => unknown) => factory(),
    useCallback: (callback: unknown) => callback,
    useRef: (initial: unknown) => ({ current: initial }),
    useEffect: jest.fn(),
    useContext: (...args: any[]) => mockUseContext(...args),
  };
});

jest.mock('../context', () => {
  const actual = jest.requireActual('../context');

  return {
    __esModule: true,
    ...actual,
    useCollapsiblePresetsOrThrow: (...args: any[]) =>
      mockUseCollapsiblePresetsOrThrow(...args),
  };
});

jest.mock('../../hooks/useMotionProgress', () => ({
  __esModule: true,
  useMotionProgress: (...args: any[]) => mockUseMotionProgress(...args),
}));

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
    GestureDetector: ({ children }: any) =>
      ReactActual.createElement('GestureDetector', null, children),
    GestureHandlerRootView: ({ children }: any) =>
      ReactActual.createElement('GestureHandlerRootView', null, children),
  };
});

import React from 'react';
import Animated from 'react-native-reanimated';
import { Bridge } from '../../components/Bridge';
import { Header } from '../../components/Header';
import { HeaderDynamic } from '../../components/HeaderDynamic';
import { HeaderMotionContextProvider } from '../../components/HeaderMotion';
import { NavigationBridge } from '../../components/NavigationBridge';
import { Collapsible } from '../Collapsible';
import { CollapsiblePresetsContext, CollapsibleTabsContext } from '../context';
import { resolveCollapsiblePresets } from '../presets';

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

const motionProgress = {
  progress: createSharedValue(0.5),
  progressThreshold: createSharedValue(100),
};

describe('Collapsible', () => {
  beforeEach(() => {
    mockUseCollapsiblePresetsOrThrow.mockReset();
    mockUseMotionProgress.mockReset();
    mockUseHeaderMotionBridge.mockReset();
    mockUseContext.mockReset();
    mockUseMotionProgress.mockReturnValue(motionProgress);
    mockUseCollapsiblePresetsOrThrow.mockReturnValue(
      resolveCollapsiblePresets('collapse')
    );
  });

  it('root renders the HeaderMotion provider and shares resolved presets', () => {
    const children = React.createElement('Child');
    const element = Collapsible({
      progressThreshold: 120,
      children,
    }) as React.ReactElement<any>;

    expect(element.type).toBe(HeaderMotionContextProvider);
    expect(element.props.progressThreshold).toBe(120);

    const presetsProvider = element.props.children;
    expect(presetsProvider.type).toBe(CollapsiblePresetsContext.Provider);
    expect(presetsProvider.props.value).toHaveLength(1);
    // No onStateChange -> no state observer rendered.
    expect(presetsProvider.props.children[0]).toBeNull();
    expect(presetsProvider.props.children[1]).toBe(children);
  });

  it('root renders a state observer when onStateChange is provided', () => {
    const element = Collapsible({
      onStateChange: jest.fn(),
      children: null,
    }) as React.ReactElement<any>;

    expect(element.props.children.props.children[0]).not.toBeNull();
  });

  it('Header slides up by the collapse distance', () => {
    const userStyle = { backgroundColor: 'red' };
    const element = Collapsible.Header({
      style: userStyle,
      children: React.createElement('Child'),
    }) as React.ReactElement<any>;

    expect(element.type).toBe(Header);
    const [style, animatedStyle] = element.props.style;
    expect(style).toBe(userStyle);
    expect(animatedStyle).toEqual({ transform: [{ translateY: -50 }] });
  });

  it('Header merges preset header styles on top of the intrinsic slide', () => {
    mockUseCollapsiblePresetsOrThrow.mockReturnValue([
      () => ({ header: { opacity: 0.5 } }),
    ]);

    const element = Collapsible.Header({
      children: null,
    }) as React.ReactElement<any>;
    const [, animatedStyle] = element.props.style;

    expect(animatedStyle).toEqual({
      transform: [{ translateY: -50 }],
      opacity: 0.5,
    });
  });

  it('Pinned counter-translates to stay in place', () => {
    const element = Collapsible.Pinned({
      children: null,
    }) as React.ReactElement<any>;

    expect(element.type).toBe(Animated.View);
    const [, animatedStyle] = element.props.style;
    expect(animatedStyle).toEqual({ transform: [{ translateY: 50 }] });
  });

  it('Dynamic clips its wrapper and animates the content with the preset', () => {
    const wrapperUserStyle = { padding: 12 };
    const contentStyle = { gap: 6 };
    const element = Collapsible.Dynamic({
      style: wrapperUserStyle,
      contentStyle,
      children: React.createElement('Child'),
    }) as React.ReactElement<any>;

    expect(element.type).toBe(HeaderDynamic);
    const [clipStyle, style, wrapperStyle] = element.props.style;
    expect(clipStyle).toEqual({ overflow: 'hidden' });
    expect(style).toBe(wrapperUserStyle);
    expect(wrapperStyle).toEqual({ transform: [{ translateY: 50 }] });

    const inner = element.props.children;
    expect(inner.type).toBe(Animated.View);
    expect(inner.props.style[0]).toBe(contentStyle);
    expect(inner.props.style[1]).toEqual({
      transform: [{ translateY: -50 }],
    });
  });

  it('NavigationHeader bridges the contexts and hands the header to render', () => {
    const presets = resolveCollapsiblePresets('fade');
    const tabsContextValue = { activeTab: 'a' };
    mockUseCollapsiblePresetsOrThrow.mockReturnValue(presets);
    mockUseContext.mockReturnValue(tabsContextValue);

    const render = jest.fn((_header: React.ReactElement) => 'rendered');
    const element = Collapsible.NavigationHeader({
      render,
      children: React.createElement('Child'),
    }) as React.ReactElement<any>;

    expect(element.type).toBe(Bridge);
    expect(mockUseContext).toHaveBeenCalledWith(CollapsibleTabsContext);

    const bridgeValue = { progress: motionProgress.progress };
    expect(element.props.children(bridgeValue)).toBe('rendered');

    const headerElement = render.mock.calls[0]![0] as React.ReactElement<any>;
    expect(headerElement.type).toBe(NavigationBridge);
    expect(headerElement.props.value).toBe(bridgeValue);

    const presetsProvider = headerElement.props.children;
    expect(presetsProvider.type).toBe(CollapsiblePresetsContext.Provider);
    expect(presetsProvider.props.value).toBe(presets);

    const tabsProvider = presetsProvider.props.children;
    expect(tabsProvider.type).toBe(CollapsibleTabsContext.Provider);
    expect(tabsProvider.props.value).toBe(tabsContextValue);
  });

  it('exposes the pre-wired scrollables as aliases', () => {
    const { ScrollView } = jest.requireActual('../../components/ScrollView');
    const { FlatList } = jest.requireActual('../../components/FlatList');

    expect(Collapsible.ScrollView).toBe(ScrollView);
    expect(Collapsible.FlatList).toBe(FlatList);
  });
});
