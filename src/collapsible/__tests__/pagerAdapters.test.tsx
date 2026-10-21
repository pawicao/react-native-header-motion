jest.mock('react', () => {
  const ReactActual = jest.requireActual('react');

  return {
    ...ReactActual,
    useMemo: (factory: () => unknown) => factory(),
    useCallback: (callback: unknown) => callback,
    useRef: (initial: unknown) => ({ current: initial }),
    useEffect: jest.fn(),
    useState: (initial: unknown) => [
      typeof initial === 'function' ? initial() : initial,
      jest.fn(),
    ],
    useImperativeHandle: (ref: any, create: () => unknown) => {
      const value = create();
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    },
  };
});

import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import {
  DefaultCollapsibleTabsPagerAdapter,
  createPagerViewAdapter,
  type CollapsibleTabsPagerController,
} from '../pagerAdapters';

describe('DefaultCollapsibleTabsPagerAdapter', () => {
  const windowWidth = Dimensions.get('window').width;

  function render(overrides: Record<string, unknown> = {}) {
    const onIndexChange = jest.fn();
    const controllerRef: { current: CollapsibleTabsPagerController | null } = {
      current: null,
    };
    const element = DefaultCollapsibleTabsPagerAdapter({
      initialIndex: 0,
      onIndexChange,
      controllerRef,
      children: [
        React.createElement('PageA', { key: 'a' }),
        React.createElement('PageB', { key: 'b' }),
      ],
      ...overrides,
    }) as React.ReactElement<any>;

    return { element, onIndexChange, controllerRef };
  }

  it('renders a paging horizontal ScrollView with fixed-width pages', () => {
    const { element } = render();

    expect(element.type).toBe(ScrollView);
    expect(element.props.horizontal).toBe(true);
    expect(element.props.pagingEnabled).toBe(true);
    expect(element.props.showsHorizontalScrollIndicator).toBe(false);

    const pages = element.props.children;
    expect(pages).toHaveLength(2);
    expect(pages[0].props.style[1]).toEqual({ width: windowWidth });
  });

  it('starts at the initial index', () => {
    const { element } = render({ initialIndex: 1 });

    expect(element.props.contentOffset).toEqual({ x: windowWidth, y: 0 });
  });

  it('reports page changes from momentum end offsets', () => {
    const { element, onIndexChange } = render();

    element.props.onMomentumScrollEnd({
      nativeEvent: { contentOffset: { x: windowWidth * 2 } },
    });

    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it('exposes a controller that does not crash before the ref attaches', () => {
    const { controllerRef } = render();

    expect(controllerRef.current).not.toBeNull();
    expect(() => controllerRef.current!.setIndex(1)).not.toThrow();
  });
});

describe('createPagerViewAdapter', () => {
  function FakePagerView() {
    return null;
  }

  it('maps the adapter contract onto pager-view props', () => {
    const Adapter = createPagerViewAdapter(FakePagerView) as (
      props: unknown
    ) => React.ReactElement;
    const onIndexChange = jest.fn();
    const controllerRef: { current: CollapsibleTabsPagerController | null } = {
      current: null,
    };

    const element = Adapter({
      initialIndex: 1,
      onIndexChange,
      controllerRef,
      children: React.createElement('Page', { key: 'a' }),
    }) as React.ReactElement<any>;

    expect(element.type).toBe(FakePagerView);
    expect(element.props.initialPage).toBe(1);

    element.props.onPageSelected({ nativeEvent: { position: 2 } });
    expect(onIndexChange).toHaveBeenCalledWith(2);

    expect(controllerRef.current).not.toBeNull();
    expect(() => controllerRef.current!.setIndex(0)).not.toThrow();
  });
});
