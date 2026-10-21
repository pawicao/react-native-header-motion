import { View } from 'react-native';
import { GestureDetector, State } from 'react-native-gesture-handler';
import { fireGestureHandler } from 'react-native-gesture-handler/jest-utils';
import { render, screen } from '@testing-library/react-native';
import { HeaderPanBoundary } from '../HeaderPanBoundary';

function createSharedValue<T>(value: T) {
  return {
    get: jest.fn(() => value),
    set: jest.fn(),
    value,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    modify: jest.fn(),
  } as any;
}

describe('HeaderPanBoundary with the installed Gesture Handler', () => {
  it('scrolls by the pan change and starts momentum on release', () => {
    const scrollTo = jest.fn();
    const headerPanMomentumOffset = createSharedValue<number | null>(null);

    render(
      <HeaderPanBoundary
        pannable
        withGestureHandlerRootView
        scrollToRef={{ current: scrollTo }}
        headerPanMomentumOffset={headerPanMomentumOffset}
      >
        <View />
      </HeaderPanBoundary>
    );

    const pan = screen.UNSAFE_getByType(GestureDetector).props.gesture;

    fireGestureHandler(pan, [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationY: 0 },
      { state: State.ACTIVE, translationY: -12 },
      { state: State.END, velocityY: -300 },
    ]);

    expect(scrollTo).toHaveBeenCalledWith(-12);
    expect(headerPanMomentumOffset.set).toHaveBeenCalled();
  });
});
