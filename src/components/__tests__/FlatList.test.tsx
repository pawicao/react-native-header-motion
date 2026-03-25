import React from 'react';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    FlatList: 'Animated.FlatList',
  },
}));

jest.mock('../createHeaderMotionScrollable', () => {
  const ReactActual = require('react');

  return {
    __esModule: true,
    createHeaderMotionScrollable: jest.fn(
      () => (props: any) => ReactActual.createElement('CreatedFlatList', props)
    ),
  };
});

import { createHeaderMotionScrollable } from '../createHeaderMotionScrollable';
import { HeaderMotionFlatList } from '../FlatList';

describe('HeaderMotionFlatList', () => {
  it('creates the built-in wrapper from the shared factory', () => {
    expect(createHeaderMotionScrollable as jest.Mock).toHaveBeenCalledWith(
      'Animated.FlatList',
      expect.objectContaining({
        displayName: 'HeaderMotion.FlatList',
        contentContainerMode: 'renderScrollComponent',
      })
    );
  });

  it('passes animatedRef through to the generated component', () => {
    const animatedRef = { current: null } as any;
    const element = HeaderMotionFlatList<{ id: string; label: string }>({
      data: [{ id: '1', label: 'Item 1' }],
      keyExtractor: (item: { id: string }) => item.id,
      renderItem: ({ item }: { item: { id: string; label: string } }) =>
        React.createElement('View', null, item.label),
      animatedRef,
    });

    expect(React.isValidElement(element)).toBe(true);
    expect((element as React.ReactElement<any>).props.animatedRef).toBe(
      animatedRef
    );
  });
});
