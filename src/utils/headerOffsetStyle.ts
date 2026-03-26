import type { SharedValue } from 'react-native-reanimated';
import type { HeaderMotionOffsetStrategy } from '../types';
import { DEFAULT_HEADER_OFFSET_STRATEGY } from './defaults';

type HeaderOffsetValue = number | SharedValue<number>;

type HeaderOffsetStyle =
  | undefined
  | { paddingTop: HeaderOffsetValue }
  | { marginTop: HeaderOffsetValue }
  | { top: HeaderOffsetValue; paddingBottom: HeaderOffsetValue }
  | {
      transform: [{ translateY: HeaderOffsetValue }];
      paddingBottom: HeaderOffsetValue;
    };

export function resolveHeaderOffsetStyle(
  originalHeaderHeight: HeaderOffsetValue,
  headerOffsetStrategy: HeaderMotionOffsetStrategy = DEFAULT_HEADER_OFFSET_STRATEGY
): HeaderOffsetStyle {
  switch (headerOffsetStrategy) {
    case 'none':
      return undefined;
    case 'margin':
      return { marginTop: originalHeaderHeight };
    case 'top':
      return {
        top: originalHeaderHeight,
        paddingBottom: originalHeaderHeight,
      };
    case 'translate':
      return {
        transform: [{ translateY: originalHeaderHeight }],
        paddingBottom: originalHeaderHeight,
      };
    case 'padding':
    default:
      return { paddingTop: originalHeaderHeight };
  }
}
