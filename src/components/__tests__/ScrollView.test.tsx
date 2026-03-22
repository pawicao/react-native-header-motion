import React from 'react';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    ScrollView: 'Animated.ScrollView',
  },
}));

jest.mock('../createHeaderMotionScrollableComponent', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    createHeaderMotionScrollableComponent: jest.fn(
      () => (props: any) =>
        ReactActual.createElement('CreatedScrollView', props)
    ),
  };
});

import { createHeaderMotionScrollableComponent } from '../createHeaderMotionScrollableComponent';
import { HeaderMotionScrollView } from '../ScrollView';

describe('HeaderMotionScrollView', () => {
  it('creates the built-in wrapper from the shared factory', () => {
    expect(
      createHeaderMotionScrollableComponent as jest.Mock
    ).toHaveBeenCalledWith(
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
