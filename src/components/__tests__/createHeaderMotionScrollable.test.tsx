import React from 'react';
import { createHeaderMotionScrollable } from '../createHeaderMotionScrollable';

jest.mock('../../hooks', () => ({
  __esModule: true,
  useScrollManager: jest.fn(() => ({
    scrollableProps: {},
    headerMotionContext: {},
  })),
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    ScrollView: 'Animated.ScrollView',
    View: 'Animated.View',
  },
}));

type GenericListProps<T> = {
  data: readonly T[];
  estimatedItemSize?: number;
  renderItem: (info: { item: T }) => React.ReactElement | null;
};

const GenericList = ((_: GenericListProps<any>) => null) as <T = any>(
  props: GenericListProps<T>
) => React.ReactElement | null;

const HeaderMotionGenericList = createHeaderMotionScrollable(GenericList, {
  displayName: 'HeaderMotion.GenericList',
  isComponentAnimated: true,
});

const validElement = (
  <HeaderMotionGenericList
    data={[{ id: '1', label: 'Row' }]}
    estimatedItemSize={120}
    renderItem={({ item }) =>
      React.createElement(React.Fragment, null, item.label)
    }
    scrollId="generic"
  />
);

const typedProps: Parameters<
  typeof HeaderMotionGenericList<{ id: string; label: string }>
>[0] = {
  data: [{ id: '1', label: 'Row' }],
  renderItem: ({ item }) =>
    React.createElement(React.Fragment, null, item.label),
};

const invalidTypedProps: Parameters<
  typeof HeaderMotionGenericList<{ id: string }>
>[0] = {
  // @ts-expect-error Item shape should stay aligned with the component generic.
  data: [{ id: 1 }],
  renderItem: ({ item }) => React.createElement(React.Fragment, null, item.id),
};

void typedProps;
void invalidTypedProps;

describe('createHeaderMotionScrollable', () => {
  it('preserves list item inference without factory generics', () => {
    expect(React.isValidElement(validElement)).toBe(true);
  });
});
