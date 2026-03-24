import React from 'react';

jest.mock('../ScrollManager', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    HeaderMotionScrollManager: ({ children, ...props }: any) =>
      ReactActual.createElement(
        'HeaderMotionScrollManager',
        props,
        typeof children === 'function'
          ? children(
              { onScroll: jest.fn(), scrollEventThrottle: 16, ref: {} },
              {
                originalHeaderHeight: 0,
                minHeightContentContainerStyle: {},
              }
            )
          : null
      ),
  };
});

import { HeaderMotionFlatList } from '../FlatList';

describe('HeaderMotionFlatList', () => {
  it('forwards progressViewOffset to ScrollManager', () => {
    const onRefresh = jest.fn();

    const element = HeaderMotionFlatList({
      data: [{ id: '1', label: 'Item 1' }],
      keyExtractor: (item) => item.id,
      renderItem: ({ item }) => React.createElement('View', null, item.label),
      refreshing: false,
      onRefresh,
      progressViewOffset: 24,
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.progressViewOffset).toBe(24);
  });

  it('applies the selected header offset strategy to the scroll container', () => {
    const element = HeaderMotionFlatList({
      data: [{ id: '1', label: 'Item 1' }],
      keyExtractor: (item) => item.id,
      renderItem: ({ item }) => React.createElement('View', null, item.label),
      headerOffsetStrategy: 'translate',
    });

    const renderedElement = element.type(element.props);
    const flatList = renderedElement.props.children;
    const scrollComponentElement = flatList.props.renderScrollComponent({
      children: null,
    });
    const scrollComponent = scrollComponentElement.type.render(
      scrollComponentElement.props,
      null
    );
    const wrapper = scrollComponent.props.children;

    expect(wrapper.props.style).toEqual([
      {},
      { transform: [{ translateY: 0 }], paddingBottom: 0 },
      undefined,
    ]);
  });
});
