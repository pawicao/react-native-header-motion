jest.mock('./useConsumerScrollHandlers', () => ({
  useConsumerScrollHandlers: () => ({}),
  useScrollHandlerComposition: (handler: unknown) => handler,
}));

import { renderHook } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { HeaderMotionContext } from '../context';
import { useScrollManager } from './useScrollManager';
import type { ScrollValues } from '../types';

function setup(initial: { current: number; min: number }, threshold = 100) {
  const values: ScrollValues = { feed: { ...initial } };
  let handlers: any;
  jest
    .spyOn(Reanimated, 'useAnimatedScrollHandler')
    .mockImplementation((value) => {
      handlers = value;
      return jest.fn() as any;
    });
  const context = {
    originalHeaderHeight: 200,
    progressThreshold: { get: () => threshold },
    headerPanMomentumOffset: { get: () => null },
    scrollValues: {
      get: () => values,
      modify: (update: (current: ScrollValues) => ScrollValues) =>
        update(values),
    },
  } as any;
  renderHook(() => useScrollManager('feed'), {
    wrapper: ({ children }) => (
      <HeaderMotionContext.Provider value={context}>
        {children}
      </HeaderMotionContext.Provider>
    ),
  });
  const handlerContext = {};
  return {
    values,
    scroll: (y: number) =>
      handlers.onScroll({ contentOffset: { y } }, handlerContext),
  };
}

afterEach(() => jest.restoreAllMocks());

it('expands on a reverse scroll from a deep collapsed offset', () => {
  const { scroll, values } = setup({ min: 400, current: 500 });

  scroll(450);
  expect(values.feed).toEqual({ min: 400, current: 450 });
  scroll(400);
  expect(values.feed).toEqual({ min: 400, current: 400 });
});

it('tracks the minimum after expansion so the next forward scroll collapses', () => {
  const { scroll, values } = setup({ min: 400, current: 500 });

  scroll(300);
  expect(values.feed).toEqual({ min: 300, current: 300 });
  scroll(350);
  expect(values.feed).toEqual({ min: 300, current: 350 });
  scroll(400);
  expect(values.feed).toEqual({ min: 300, current: 400 });
  scroll(700);
  expect(values.feed).toEqual({ min: 600, current: 700 });
});

it('keeps the minimum at zero during overscroll', () => {
  const { scroll, values } = setup({ min: 0, current: 100 });

  scroll(-30);
  expect(values.feed).toEqual({ min: 0, current: -30 });
  scroll(0);
  expect(values.feed).toEqual({ min: 0, current: 0 });
});
