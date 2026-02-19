import { createContext } from 'react';
import { type SharedValue } from 'react-native-reanimated';
import type {
  MeasureAnimatedHeaderAndSet,
  Progress,
  ScrollTo,
  ScrollToSv,
  ScrollValues,
} from './types';

interface HeaderMotionContextType {
  progress: Progress;
  measureTotalHeight: MeasureAnimatedHeaderAndSet;
  measureDynamic: MeasureAnimatedHeaderAndSet;
  scrollValues: SharedValue<ScrollValues>;
  activeScrollId: SharedValue<string> | undefined;
  progressThreshold: SharedValue<number>;
  originalHeaderHeight: SharedValue<number>;

  scrollTo: ScrollToSv;
  scrollToRef: React.RefObject<ScrollTo | null>;
}

export const HeaderMotionContext =
  createContext<HeaderMotionContextType | null>(null);
