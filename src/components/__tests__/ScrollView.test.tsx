import React from 'react';

jest.mock('react-native-reanimated', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    default: {
      FlatList: (props: any) => ReactActual.createElement('FlatList', props),
      ScrollView: (props: any) =>
        ReactActual.createElement('ScrollView', props),
      View: (props: any) => ReactActual.createElement('View', props),
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

import { HeaderMotionScrollView } from '../ScrollView';

describe('HeaderMotionScrollView', () => {
  it('applies the selected header offset strategy to the content wrapper', () => {
    const element = HeaderMotionScrollView({
      headerOffsetStrategy: 'margin',
      children: React.createElement('View'),
    });

    const scrollView = element.props.children;
    const wrapper = scrollView.props.children;

    expect(wrapper.props.style).toEqual([
      {},
      { marginTop: 0 },
      undefined,
    ]);
  });
});
