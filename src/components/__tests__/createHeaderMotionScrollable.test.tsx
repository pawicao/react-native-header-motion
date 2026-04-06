const mockUseScrollManager = jest.fn();
const mockCreateAnimatedComponent = jest.fn((Component) => Component);
jest.mock('react', () => {
  const ReactActual = jest.requireActual('react');

  return {
    ...ReactActual,
    useMemo: (factory: () => unknown) => factory(),
    useCallback: <T extends (...args: any[]) => any>(callback: T) => callback,
    useRef: <T,>(value: T) => ({ current: value }),
    useLayoutEffect: (effect: () => void) => effect(),
    forwardRef: (render: any) => {
      const Forwarded = (props: any) => render(props, null);
      Forwarded.render = render;
      return Forwarded;
    },
  };
});

import React from 'react';
import {
  createHeaderMotionScrollable,
  type CreateHeaderMotionScrollableOptions,
} from '../createHeaderMotionScrollable';

jest.mock('../../hooks', () => ({
  __esModule: true,
  useScrollManager: (...args: any[]) => mockUseScrollManager(...args),
}));

jest.mock('react-native-reanimated', () => {
  const ReactActual = jest.requireActual('react');

  const ScrollView = (props: any) =>
    ReactActual.createElement('Animated.ScrollView', props);
  const View = (props: any) =>
    ReactActual.createElement('Animated.View', props);

  return {
    __esModule: true,
    default: {
      ScrollView,
      View,
      createAnimatedComponent: mockCreateAnimatedComponent,
    },
  };
});

type GenericListProps<T> = {
  data: readonly T[];
  estimatedItemSize?: number;
  contentContainerStyle?: { backgroundColor?: string };
  renderItem: (info: { item: T }) => React.ReactElement | null;
};

const GenericList = ((_: GenericListProps<any>) => null) as <T = any>(
  props: GenericListProps<T>
) => React.ReactElement | null;

const HeaderMotionGenericList = createHeaderMotionScrollable(GenericList, {
  displayName: 'HeaderMotion.GenericList',
  isComponentAnimated: true,
});

const validElement = (
  <HeaderMotionGenericList
    data={[{ id: '1', label: 'Row' }]}
    estimatedItemSize={120}
    ensureScrollableContentMinHeight={false}
    headerOffsetStrategy="none"
    renderItem={({ item }) =>
      React.createElement(React.Fragment, null, item.label)
    }
    scrollId="generic"
  />
);

const typedProps: Parameters<
  typeof HeaderMotionGenericList<{ id: string; label: string }>
>[0] = {
  data: [{ id: '1', label: 'Row' }],
  ensureScrollableContentMinHeight: false,
  headerOffsetStrategy: 'padding',
  renderItem: ({ item }) =>
    React.createElement(React.Fragment, null, item.label),
};

const invalidTypedProps: Parameters<
  typeof HeaderMotionGenericList<{ id: string }>
>[0] = {
  // @ts-expect-error Item shape should stay aligned with the component generic.
  data: [{ id: 1 }],
  renderItem: ({ item }) => React.createElement(React.Fragment, null, item.id),
};

// eslint-disable-next-line no-void
void typedProps;
// eslint-disable-next-line no-void
void invalidTypedProps;

const validChildrenOptions: CreateHeaderMotionScrollableOptions = {
  contentContainerMode: 'children',
};

const invalidChildrenOptions: CreateHeaderMotionScrollableOptions = {
  contentContainerMode: 'children',
  // @ts-expect-error managedRefTarget is only valid for renderScrollComponent mode.
  managedRefTarget: 'inner',
};

// eslint-disable-next-line no-void
void validChildrenOptions;
// eslint-disable-next-line no-void
void invalidChildrenOptions;

function createScrollManagerResult() {
  return {
    scrollableProps: {
      onScroll: jest.fn(),
      ref: { current: null },
      refreshControl: React.createElement('ManagedRefreshControl'),
    },
    headerMotionContext: {
      originalHeaderHeight: 48,
      contentContainerMinHeight: 320,
    },
  };
}

describe('createHeaderMotionScrollable', () => {
  beforeEach(() => {
    mockUseScrollManager.mockReset();
    mockCreateAnimatedComponent.mockClear();
  });

  it('preserves list item inference without factory generics', () => {
    expect(React.isValidElement(validElement)).toBe(true);
  });

  it('derives a default displayName from the wrapped component name', () => {
    const PlainScrollable = (props: any) =>
      React.createElement('PlainScrollable', props);

    const WrappedScrollable = createHeaderMotionScrollable(PlainScrollable);

    expect(WrappedScrollable.displayName).toBe('HeaderMotion(PlainScrollable)');
  });

  it('uses an explicit displayName override when provided', () => {
    expect(HeaderMotionGenericList.displayName).toBe(
      'HeaderMotion.GenericList'
    );
  });

  it('wires useScrollManager output and children mode styles into the wrapped component', () => {
    const scrollManagerResult = createScrollManagerResult();
    mockUseScrollManager.mockReturnValue(scrollManagerResult);

    const PlainScrollable = (props: any) =>
      React.createElement('PlainScrollable', props);
    const HeaderMotionPlainScrollable = createHeaderMotionScrollable(
      PlainScrollable,
      {
        contentContainerMode: 'children',
      }
    );

    const userRefreshControl = React.createElement('UserRefreshControl');
    const userOnScroll = jest.fn();
    const userOnRefresh = jest.fn();
    const animatedRef = { current: null } as any;
    const contentContainerStyle = { backgroundColor: 'tomato' };

    const element = HeaderMotionPlainScrollable({
      scrollId: 'plain',
      animatedRef,
      headerOffsetStrategy: 'margin',
      ensureScrollableContentMinHeight: false,
      contentContainerStyle,
      refreshControl: userRefreshControl,
      refreshing: true,
      onRefresh: userOnRefresh,
      progressViewOffset: 12,
      onScroll: userOnScroll,
      children: React.createElement('Child'),
    }) as React.ReactElement<any>;

    expect(mockUseScrollManager).toHaveBeenCalledWith(
      'plain',
      expect.objectContaining({
        animatedRef,
        refreshControl: userRefreshControl,
        refreshing: true,
        onRefresh: userOnRefresh,
        progressViewOffset: 12,
        onScroll: userOnScroll,
      })
    );

    expect(element.props.ref).toBe(scrollManagerResult.scrollableProps.ref);
    expect(element.props.onScroll).toBe(
      scrollManagerResult.scrollableProps.onScroll
    );
    expect(element.props.refreshControl).toBe(
      scrollManagerResult.scrollableProps.refreshControl
    );
    expect(element.props.children.props.style).toEqual([
      undefined,
      { marginTop: 48 },
      contentContainerStyle,
    ]);
  });

  it('injects renderScrollComponent with merged offset and min-height styles for list-like components', () => {
    const scrollManagerResult = createScrollManagerResult();
    mockUseScrollManager.mockReturnValue(scrollManagerResult);

    const contentContainerStyle = { backgroundColor: 'royalblue' };
    const element = HeaderMotionGenericList({
      data: [{ id: '1', label: 'Row' }],
      headerOffsetStrategy: 'translate',
      ensureScrollableContentMinHeight: true,
      contentContainerStyle,
      renderItem: ({ item }) =>
        React.createElement(React.Fragment, null, item.label),
    }) as React.ReactElement<any>;

    expect(mockUseScrollManager).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        animatedRef: undefined,
      })
    );
    expect(element.props.children).toBeUndefined();
    expect(element.props.ref).toBe(scrollManagerResult.scrollableProps.ref);
    expect(typeof element.props.renderScrollComponent).toBe('function');

    const scrollComponentElement = element.props.renderScrollComponent({
      children: React.createElement('Child'),
      ref: { current: null },
    });
    const renderedScrollComponent = scrollComponentElement.type.render(
      scrollComponentElement.props,
      null
    ) as React.ReactElement<any>;

    expect(renderedScrollComponent.props.children.props.style).toEqual([
      { minHeight: 320 },
      { transform: [{ translateY: 48 }], paddingBottom: 48 },
      contentContainerStyle,
    ]);
  });

  it('can target the injected inner scroll component for imperative sync', () => {
    const scrollManagerResult = createScrollManagerResult();
    mockUseScrollManager.mockReturnValue(scrollManagerResult);

    const InnerManagedList = createHeaderMotionScrollable(GenericList, {
      displayName: 'HeaderMotion.InnerManagedList',
      isComponentAnimated: true,
      managedRefTarget: 'inner',
    });

    const animatedRef = { current: null } as any;
    const element = InnerManagedList({
      data: [{ id: '1', label: 'Row' }],
      animatedRef,
      renderItem: ({ item }) =>
        React.createElement(React.Fragment, null, item.label),
    }) as React.ReactElement<any>;

    expect(mockUseScrollManager).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        animatedRef: undefined,
      })
    );
    expect(element.props.ref).toBe(animatedRef);
    expect(typeof element.props.renderScrollComponent).toBe('function');
  });
});
