import type { ReactElement } from 'react';
import type { LayoutChangeEvent, ScrollViewProps } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import { DEFAULT_SCROLL_ID } from './utils/defaults';

export type Progress = SharedValue<number>;

export type ProgressThreshold =
  | number
  | ((measuredHeaderValue: number) => number);
export type MeasureAnimatedHeader = (e: LayoutChangeEvent) => number;
export type MeasureAnimatedHeaderAndSet = (e: LayoutChangeEvent) => void;

export type ActiveScrollIdValues<T extends string = string> = {
  state: T;
  sv: SharedValue<T>;
};
export type SetActiveScrollId<T extends string> = (newId: T) => void;

export interface ScrollValue {
  min: number;
  current: number;
}
export type ScrollValues = Record<string, ScrollValue> & {
  [key in typeof DEFAULT_SCROLL_ID]?: ScrollValue;
};

export type WithCollapsibleHeaderProps<
  T extends Record<string, unknown> = Record<string, unknown>
> = T & MotionProgress;

export type WithCollapsiblePagedHeaderProps<
  Tab extends string = string,
  T extends Record<string, unknown> = Record<string, unknown>
> = WithCollapsibleHeaderProps<T> & {
  onTabChange: (newTab: Tab) => void;
  activeTab: Tab;
};

export interface MotionProgress {
  progress: Progress;
  progressThreshold: SharedValue<number>;
  measureTotalHeight: MeasureAnimatedHeaderAndSet;
  measureDynamic: MeasureAnimatedHeaderAndSet;
  animatedHeaderBaseProps: AnimatedHeaderBaseMotionProps;
  activeScrollId: SharedValue<string> | undefined;
}

export interface AnimatedHeaderBaseMotionProps {
  enableHeaderPan: boolean;
  scrollToRef: React.RefObject<ScrollTo | null>;
  headerPanMomentumOffset: SharedValue<number | null>;
}

export interface ScrollManagerHeaderMotionContext {
  originalHeaderHeight: SharedValue<number>;
  minHeightContentContainerStyle:
    | {}
    | {
        minHeight: number;
      };
}

export interface ScrollManagerConfig<TRef = any> {
  scrollableProps: Required<
    Pick<ScrollViewProps, 'onScroll' | 'scrollEventThrottle'>
  > & {
    refreshControl?: ReactElement;
    // @ts-expect-error 4.2.0 of reanimated should help here? TODO
    ref: AnimatedRef<TRef>;
  };
  headerMotionContext: ScrollManagerHeaderMotionContext;
}

export type ScrollTo = (y: number, options?: ScrollToOptions) => void;

interface ScrollToOptions {
  isValueDelta?: boolean;
  animated?: boolean;
}
