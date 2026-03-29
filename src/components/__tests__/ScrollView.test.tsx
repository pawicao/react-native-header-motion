import React from 'react';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    ScrollView: 'Animated.ScrollView',
  },
}));

jest.mock('../createHeaderMotionScrollable', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    createHeaderMotionScrollable: jest.fn(
      () => (props: any) =>
        ReactActual.createElement('CreatedScrollView', props)
    ),
  };
});

import { createHeaderMotionScrollable } from '../createHeaderMotionScrollable';
import { ScrollView } from '../ScrollView';

describe('ScrollView', () => {
  it('creates the built-in wrapper from the shared factory', () => {
    expect(createHeaderMotionScrollable as jest.Mock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        displayName: 'HeaderMotion.ScrollView',
        contentContainerMode: 'children',
        isComponentAnimated: true,
      })
    );
  });

  it('passes header motion props through to the generated component', () => {
    const animatedRef = { current: null } as any;
    const element = ScrollView({
      animatedRef,
      headerOffsetStrategy: 'margin',
      ensureScrollableContentMinHeight: false,
      children: React.createElement('View'),
    });

    expect(React.isValidElement(element)).toBe(true);
    expect((element as React.ReactElement<any>).props.animatedRef).toBe(
      animatedRef
    );
    expect(
      (element as React.ReactElement<any>).props.headerOffsetStrategy
    ).toBe('margin');
    expect(
      (element as React.ReactElement<any>).props
        .ensureScrollableContentMinHeight
    ).toBe(false);
  });
});
