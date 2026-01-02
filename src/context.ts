import { createContext } from 'react';
import { type SharedValue } from 'react-native-reanimated';
import type {
  MeasureAnimatedHeaderAndSet,
  Progress,
  ScrollValues,
} from './types';

interface HeaderMotionContextType {
  progress: Progress;
  measureTotal: MeasureAnimatedHeaderAndSet;
  measureDynamic: MeasureAnimatedHeaderAndSet;
  scrollValues: SharedValue<ScrollValues>;
  activeScrollId: SharedValue<string> | undefined;
  progressThreshold: number;
  originalHeaderHeight: number;
}

export const HeaderMotionContext =
  createContext<HeaderMotionContextType | null>(null);
