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
import { HeaderMotionScrollView } from '../ScrollView';

describe('HeaderMotionScrollView', () => {
  it('creates the built-in wrapper from the shared factory', () => {
    expect(createHeaderMotionScrollable as jest.Mock).toHaveBeenCalledWith(
      'Animated.ScrollView',
      expect.objectContaining({
        displayName: 'HeaderMotion.ScrollView',
      })
    );
  });

  it('passes animatedRef through to the generated component', () => {
    const animatedRef = { current: null } as any;
    const element = HeaderMotionScrollView({
      animatedRef,
      children: React.createElement('View'),
    });

    expect(React.isValidElement(element)).toBe(true);
    expect((element as React.ReactElement<any>).props.animatedRef).toBe(
      animatedRef
    );
  });
});
