import { useCallback } from 'react';
import type {
  AnimatedScrollViewProps,
  ScrollHandler,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type ConsumerScrollHandler = (event: unknown) => void;
type ScrollEvent = Parameters<ScrollHandler<Record<string, unknown>>>[0];

export type ConsumerScrollEventHandlers = Pick<
  AnimatedScrollViewProps,
  | 'onScroll'
  | 'onScrollBeginDrag'
  | 'onScrollEndDrag'
  | 'onMomentumScrollBegin'
  | 'onMomentumScrollEnd'
>;

export interface ConsumerScrollBridges {
  onScroll?: (event: ScrollEvent) => void;
  onBeginDrag?: (event: ScrollEvent) => void;
  onEndDrag?: (event: ScrollEvent) => void;
  onMomentumBegin?: (event: ScrollEvent) => void;
  onMomentumEnd?: (event: ScrollEvent) => void;
}

export function useConsumerScrollHandlers({
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
}: ConsumerScrollEventHandlers): ConsumerScrollBridges {
  const consumerOnScroll =
    typeof onScroll === 'function'
      ? (onScroll as ConsumerScrollHandler)
      : undefined;
  const consumerOnScrollBeginDrag =
    typeof onScrollBeginDrag === 'function'
      ? (onScrollBeginDrag as ConsumerScrollHandler)
      : undefined;
  const consumerOnScrollEndDrag =
    typeof onScrollEndDrag === 'function'
      ? (onScrollEndDrag as ConsumerScrollHandler)
      : undefined;
  const consumerOnMomentumScrollBegin =
    typeof onMomentumScrollBegin === 'function'
      ? (onMomentumScrollBegin as ConsumerScrollHandler)
      : undefined;
  const consumerOnMomentumScrollEnd =
    typeof onMomentumScrollEnd === 'function'
      ? (onMomentumScrollEnd as ConsumerScrollHandler)
      : undefined;

  const onScrollBridge = useCallback(
    (event: ScrollEvent) => {
      'worklet';
      if (!consumerOnScroll) {
        return;
      }
      scheduleOnRN(consumerOnScroll, { nativeEvent: event } as unknown);
    },
    [consumerOnScroll]
  );

  const onBeginDragBridge = useCallback(
    (event: ScrollEvent) => {
      'worklet';
      if (!consumerOnScrollBeginDrag) {
        return;
      }
      scheduleOnRN(consumerOnScrollBeginDrag, {
        nativeEvent: event,
      } as unknown);
    },
    [consumerOnScrollBeginDrag]
  );

  const onEndDragBridge = useCallback(
    (event: ScrollEvent) => {
      'worklet';
      if (!consumerOnScrollEndDrag) {
        return;
      }
      scheduleOnRN(consumerOnScrollEndDrag, { nativeEvent: event } as unknown);
    },
    [consumerOnScrollEndDrag]
  );

  const onMomentumBeginBridge = useCallback(
    (event: ScrollEvent) => {
      'worklet';
      if (!consumerOnMomentumScrollBegin) {
        return;
      }
      scheduleOnRN(consumerOnMomentumScrollBegin, {
        nativeEvent: event,
      } as unknown);
    },
    [consumerOnMomentumScrollBegin]
  );

  const onMomentumEndBridge = useCallback(
    (event: ScrollEvent) => {
      'worklet';
      if (!consumerOnMomentumScrollEnd) {
        return;
      }
      scheduleOnRN(consumerOnMomentumScrollEnd, {
        nativeEvent: event,
      } as unknown);
    },
    [consumerOnMomentumScrollEnd]
  );

  return {
    onScroll: onScrollBridge,
    onBeginDrag: onBeginDragBridge,
    onEndDrag: onEndDragBridge,
    onMomentumBegin: onMomentumBeginBridge,
    onMomentumEnd: onMomentumEndBridge,
  };
}
