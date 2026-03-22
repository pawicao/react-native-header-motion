import React from 'react';

const mockUseScrollManager = jest.fn();
const mockCreateAnimatedComponent = jest.fn();

jest.mock('../../hooks', () => ({
  __esModule: true,
  useScrollManager: (...args: any[]) => mockUseScrollManager(...args),
}));

jest.mock('react-native-reanimated', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (...args: any[]) =>
        mockCreateAnimatedComponent(...args),
      ScrollView: (props: any) =>
        ReactActual.createElement('ScrollView', props),
      View: (props: any) => ReactActual.createElement('AnimatedView', props),
      FlatList: (props: any) => ReactActual.createElement('FlatList', props),
    },
  };
});

import { createHeaderMotionScrollableComponent } from '../createHeaderMotionScrollableComponent';

describe('createHeaderMotionScrollableComponent', () => {
  const managedOnScroll = jest.fn();
  const managedRef = { current: null };
  const managedRefreshControl = React.createElement('RefreshControl');

  beforeEach(() => {
    mockCreateAnimatedComponent.mockImplementation(
      (Component: React.ComponentType<any>) =>
        function AnimatedWrappedComponent(props: any) {
          return React.createElement(Component, props, props.children);
        }
    );
    mockUseScrollManager.mockReturnValue({
      scrollableProps: {
        onScroll: managedOnScroll,
        scrollEventThrottle: 16,
        ref: managedRef,
        refreshControl: managedRefreshControl,
      },
      headerMotionContext: {
        originalHeaderHeight: 72,
        minHeightContentContainerStyle: { minHeight: 320 },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wraps scroll-view style content in an inner animated container', () => {
    const BaseScroll = (props: any) =>
      React.createElement('BaseScroll', props, props.children);
    const MotionScroll = createHeaderMotionScrollableComponent(BaseScroll);
    const child = React.createElement('Child');

    const element = MotionScroll({
      scrollId: 'main',
      children: child,
      contentContainerStyle: { paddingBottom: 12 },
      onRefresh: jest.fn(),
    });

    expect(mockUseScrollManager).toHaveBeenCalledWith(
      'main',
      expect.objectContaining({
        onRefresh: expect.any(Function),
      })
    );
    expect(mockCreateAnimatedComponent).toHaveBeenCalledWith(BaseScroll);
    expect(element.props.onScroll).toBe(managedOnScroll);
    expect(element.props.scrollEventThrottle).toBe(16);
    expect(element.props.ref).toBe(managedRef);
    expect(element.props.refreshControl).toBe(managedRefreshControl);
    expect(element.props.children.props.style).toEqual([
      { minHeight: 320 },
      { paddingTop: 72 },
      { paddingBottom: 12 },
    ]);
    expect(element.props.children.props.children).toBe(child);
  });

  it('injects a renderScrollComponent wrapper for list-style components', () => {
    const BaseList = (props: any) => React.createElement('BaseList', props);
    const MotionList = createHeaderMotionScrollableComponent(BaseList, {
      contentContainerMode: 'renderScrollComponent',
    });

    const element = MotionList({
      contentContainerStyle: { paddingBottom: 12 },
    });

    expect(element.props.children).toBeUndefined();
    expect(element.props.renderScrollComponent).toEqual(expect.any(Function));

    const scrollComponent = element.props.renderScrollComponent({
      keyboardDismissMode: 'on-drag',
    });

    expect(scrollComponent.props.keyboardDismissMode).toBe('on-drag');
    expect(scrollComponent.props.contentContainerStyle).toEqual([
      { minHeight: 320 },
      { paddingTop: 72 },
      { paddingBottom: 12 },
    ]);
  });

  it('does not wrap the provided component when animation is assumed', () => {
    const BaseScroll = (props: any) =>
      React.createElement('BaseScroll', props, props.children);

    createHeaderMotionScrollableComponent(BaseScroll, {
      componentAnimation: 'assume-animated',
    });

    expect(mockCreateAnimatedComponent).not.toHaveBeenCalled();
  });

  it('does not auto-wrap when the managed ref targets the injected scroll component', () => {
    const BaseList = (props: any) => React.createElement('BaseList', props);

    createHeaderMotionScrollableComponent(BaseList, {
      contentContainerMode: 'renderScrollComponent',
      animatedRefTarget: 'scrollComponent',
    });

    expect(mockCreateAnimatedComponent).not.toHaveBeenCalled();
  });

  it('wraps the provided component when explicitly requested', () => {
    const BaseList = (props: any) => React.createElement('BaseList', props);

    createHeaderMotionScrollableComponent(BaseList, {
      contentContainerMode: 'renderScrollComponent',
      animatedRefTarget: 'scrollComponent',
      componentAnimation: 'wrap',
    });

    expect(mockCreateAnimatedComponent).toHaveBeenCalledWith(BaseList);
  });
});
