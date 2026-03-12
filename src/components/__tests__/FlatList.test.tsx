import React from 'react';

jest.mock('react-native-reanimated', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    default: {
      FlatList: (props: any) => ReactActual.createElement('FlatList', props),
      ScrollView: (props: any) =>
        ReactActual.createElement('ScrollView', props),
    },
  };
});

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
});
