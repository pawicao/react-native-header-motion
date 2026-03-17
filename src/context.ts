import { createContext } from 'react';
import { type SharedValue } from 'react-native-reanimated';
import type {
  MeasureAnimatedHeaderAndSet,
  Progress,
  ScrollTo,
  ScrollValues,
} from './types';

interface HeaderMotionContextType {
  progress: Progress;
  measureTotalHeight: MeasureAnimatedHeaderAndSet;
  measureDynamic: MeasureAnimatedHeaderAndSet;
  enableHeaderPan: boolean;
  headerPanMomentumOffset: SharedValue<number | null>;
  scrollValues: SharedValue<ScrollValues>;
  activeScrollId: SharedValue<string> | undefined;
  progressThreshold: SharedValue<number>;
  originalHeaderHeight: SharedValue<number>;

  scrollToRef: React.RefObject<ScrollTo | null>;
}

export const HeaderMotionContext =
  createContext<HeaderMotionContextType | null>(null);
