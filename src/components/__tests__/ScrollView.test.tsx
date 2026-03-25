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
              { onScroll: jest.fn(), ref: {} },
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
  it('skips minHeightContentContainerStyle when disabled', () => {
    const element = HeaderMotionScrollView({
      ensureScrollableContentMinHeight: false,
      children: React.createElement('View'),
    });

    const renderedElement = element.type(element.props);
    const scrollView = renderedElement.props.children;
    const wrapper = scrollView.props.children;

    expect(wrapper.props.style).toEqual([
      undefined,
      { paddingTop: 0 },
      undefined,
    ]);
  });

  it('applies the selected header offset strategy to the content wrapper', () => {
    const element = HeaderMotionScrollView({
      headerOffsetStrategy: 'margin',
      children: React.createElement('View'),
    });

    const renderedElement = element.type(element.props);
    const scrollView = renderedElement.props.children;
    const wrapper = scrollView.props.children;

    expect(wrapper.props.style).toEqual([{}, { marginTop: 0 }, undefined]);
  });
});
