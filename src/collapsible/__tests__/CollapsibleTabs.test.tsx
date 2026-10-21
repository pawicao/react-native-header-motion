const mockUseActiveScrollId = jest.fn();
const mockUseCollapsibleTabsContextOrThrow = jest.fn();

jest.mock('react', () => {
  const ReactActual = jest.requireActual('react');

  return {
    ...ReactActual,
    useMemo: (factory: () => unknown) => factory(),
    useCallback: (callback: unknown) => callback,
    useRef: (initial: unknown) => ({ current: initial }),
    useEffect: jest.fn(),
  };
});

jest.mock('../context', () => {
  const actual = jest.requireActual('../context');

  return {
    __esModule: true,
    ...actual,
    useCollapsibleTabsContextOrThrow: (...args: any[]) =>
      mockUseCollapsibleTabsContextOrThrow(...args),
  };
});

jest.mock('../../hooks/useActiveScrollId', () => ({
  __esModule: true,
  useActiveScrollId: (...args: any[]) => mockUseActiveScrollId(...args),
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
import { Pressable, View } from 'react-native';
import { HeaderMotionScrollIdContext } from '../../context';
import { Collapsible } from '../Collapsible';
import { CollapsibleTabs } from '../CollapsibleTabs';
import { CollapsibleTabsContext } from '../context';
import { DefaultCollapsibleTabsPagerAdapter } from '../pagerAdapters';

const activeSv = { value: 'a' };
let setActiveScrollId: jest.Mock;

function mockActiveScroll(state: string) {
  setActiveScrollId = jest.fn();
  mockUseActiveScrollId.mockReturnValue([
    { state, sv: activeSv },
    setActiveScrollId,
  ]);
}

function renderRoot(props: Record<string, unknown> = {}) {
  const element = CollapsibleTabs({
    tabs: ['a', 'b'],
    children: React.createElement('Child'),
    ...props,
  } as any) as React.ReactElement<any>;

  const tabsProvider = element.props.children;
  return { element, tabsProvider, contextValue: tabsProvider.props.value };
}

describe('CollapsibleTabs root', () => {
  beforeEach(() => {
    mockUseActiveScrollId.mockReset();
    mockUseCollapsibleTabsContextOrThrow.mockReset();
    mockActiveScroll('a');
  });

  it('renders a Collapsible root wired to the active scroll id', () => {
    const { element, tabsProvider, contextValue } = renderRoot({
      preset: 'fade',
    });

    expect(element.type).toBe(Collapsible);
    expect(element.props.activeScrollId).toBe(activeSv);
    expect(element.props.preset).toBe('fade');
    expect(mockUseActiveScrollId).toHaveBeenCalledWith('a');

    expect(tabsProvider.type).toBe(CollapsibleTabsContext.Provider);
    expect(contextValue.tabs).toEqual([
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
    ]);
    expect(contextValue.activeTab).toBe('a');
    expect(contextValue.initialIndex).toBe(0);
  });

  it('normalizes labeled tab entries', () => {
    const { contextValue } = renderRoot({
      tabs: [{ name: 'a', label: 'Page A' }, { name: 'b' }],
    });

    expect(contextValue.tabs).toEqual([
      { name: 'a', label: 'Page A' },
      { name: 'b', label: 'b' },
    ]);
  });

  it('resolves initialTab to the matching index', () => {
    const { contextValue } = renderRoot({ initialTab: 'b' });

    expect(mockUseActiveScrollId).toHaveBeenCalledWith('b');
    expect(contextValue.initialIndex).toBe(1);
  });

  it('warns and falls back to the first tab for an unknown initialTab', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { contextValue } = renderRoot({ initialTab: 'nope' });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('initialTab "nope"')
    );
    expect(mockUseActiveScrollId).toHaveBeenCalledWith('a');
    expect(contextValue.initialIndex).toBe(0);
    warn.mockRestore();
  });

  it('throws without tabs', () => {
    expect(() => renderRoot({ tabs: [] })).toThrow('at least one tab');
  });

  it('goTo moves the pager and activates the tab', () => {
    const onTabChange = jest.fn();
    const { contextValue } = renderRoot({ onTabChange });
    const setIndex = jest.fn();
    contextValue.controllerRef.current = { setIndex };

    contextValue.goTo('b');

    expect(setIndex).toHaveBeenCalledWith(1);
    expect(setActiveScrollId).toHaveBeenCalledWith('b');
    expect(onTabChange).toHaveBeenCalledWith('b');
  });

  it('goTo on the active tab still moves the pager but does not re-activate', () => {
    const onTabChange = jest.fn();
    const { contextValue } = renderRoot({ onTabChange });
    const setIndex = jest.fn();
    contextValue.controllerRef.current = { setIndex };

    contextValue.goTo('a');

    expect(setIndex).toHaveBeenCalledWith(0);
    expect(setActiveScrollId).not.toHaveBeenCalled();
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('goTo warns on unknown tabs', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { contextValue } = renderRoot({});

    contextValue.goTo('nope');

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('unknown tab "nope"')
    );
    expect(setActiveScrollId).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('pager index changes activate the corresponding tab once', () => {
    const onTabChange = jest.fn();
    const { contextValue } = renderRoot({ onTabChange });

    contextValue.onPagerIndexChange(1);
    expect(setActiveScrollId).toHaveBeenCalledWith('b');
    expect(onTabChange).toHaveBeenCalledWith('b');

    setActiveScrollId.mockClear();
    onTabChange.mockClear();
    contextValue.onPagerIndexChange(0);
    expect(setActiveScrollId).not.toHaveBeenCalled();
    expect(onTabChange).not.toHaveBeenCalled();
  });
});

describe('CollapsibleTabs.Pager', () => {
  const tabsContext = () => ({
    tabs: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
    ],
    activeTab: 'a',
    goTo: jest.fn(),
    initialIndex: 1,
    controllerRef: { current: null },
    onPagerIndexChange: jest.fn(),
  });

  beforeEach(() => {
    mockUseCollapsibleTabsContextOrThrow.mockReset();
  });

  it('renders the tabs through the default adapter with keyed pages', () => {
    const contextValue = tabsContext();
    mockUseCollapsibleTabsContextOrThrow.mockReturnValue(contextValue);

    const element = CollapsibleTabs.Pager({
      children: [
        React.createElement(CollapsibleTabs.Tab, { name: 'a' }),
        React.createElement(CollapsibleTabs.Tab, { name: 'b' }),
      ],
    }) as React.ReactElement<any>;

    expect(element.type).toBe(DefaultCollapsibleTabsPagerAdapter);
    expect(element.props.initialIndex).toBe(1);
    expect(element.props.controllerRef).toBe(contextValue.controllerRef);
    expect(element.props.onIndexChange).toBe(contextValue.onPagerIndexChange);

    const pages = element.props.children;
    expect(pages).toHaveLength(2);
    expect(pages[0].key).toBe('a');
    expect(pages[1].key).toBe('b');
  });

  it('renders through a custom adapter when provided', () => {
    mockUseCollapsibleTabsContextOrThrow.mockReturnValue({
      ...tabsContext(),
      tabs: [{ name: 'a', label: 'a' }],
    });
    const CustomAdapter = jest.fn();

    const element = CollapsibleTabs.Pager({
      adapter: CustomAdapter,
      children: React.createElement(CollapsibleTabs.Tab, { name: 'a' }),
    }) as React.ReactElement<any>;

    expect(element.type).toBe(CustomAdapter);
  });

  it('warns when the children do not match the tabs prop', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockUseCollapsibleTabsContextOrThrow.mockReturnValue(tabsContext());

    CollapsibleTabs.Pager({
      children: React.createElement(CollapsibleTabs.Tab, { name: 'b' }),
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('do not match the `tabs` prop')
    );
    warn.mockRestore();
  });
});

describe('CollapsibleTabs.Tab', () => {
  it('provides its name as the default scrollId', () => {
    const child = React.createElement('Child');
    const element = CollapsibleTabs.Tab({
      name: 'feed',
      children: child,
    }) as React.ReactElement<any>;

    expect(element.type).toBe(View);
    expect(element.props.collapsable).toBe(false);

    const provider = element.props.children;
    expect(provider.type).toBe(HeaderMotionScrollIdContext.Provider);
    expect(provider.props.value).toBe('feed');
    expect(provider.props.children).toBe(child);
  });
});

describe('CollapsibleTabs.Bar', () => {
  beforeEach(() => {
    mockUseCollapsibleTabsContextOrThrow.mockReset();
  });

  it('renders a pressable per tab and navigates on press', () => {
    const goTo = jest.fn();
    mockUseCollapsibleTabsContextOrThrow.mockReturnValue({
      tabs: [
        { name: 'a', label: 'Page A' },
        { name: 'b', label: 'Page B' },
      ],
      activeTab: 'a',
      goTo,
    });

    const element = CollapsibleTabs.Bar({}) as React.ReactElement<any>;
    expect(element.type).toBe(View);

    const [first, second] = element.props.children;
    expect(first.type).toBe(Pressable);
    expect(first.props.accessibilityState).toEqual({ selected: true });
    expect(second.props.accessibilityState).toEqual({ selected: false });

    second.props.onPress();
    expect(goTo).toHaveBeenCalledWith('b');
  });
});
