import type { ReactElement } from 'react';
import type { LayoutChangeEvent, ScrollViewProps } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import { DEFAULT_SCROLL_ID } from './utils/defaults';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';

export type Progress = SharedValue<number>;
export type HeaderMotionOffsetStrategy =
  | 'padding'
  | 'margin'
  | 'top'
  | 'translate'
  | 'none';

export interface HeaderMotionOffsetProps {
  /**
   * Strategy used to offset the scrollable content by the measured original header height.
   *
   * `top` and `translate` keep the bottom of the content reachable by compensating with extra bottom space.
   *
   * @default 'padding'
   */
  headerOffsetStrategy?: HeaderMotionOffsetStrategy;
  /**
   * Ensures the content container gets a minimum height large enough for short
   * content to still scroll far enough to drive the header to its collapsed state.
   *
   * Experimental: this relies on extra layout measurement and may be refined in a future release.
   *
   * @default false
   */
  ensureScrollableContentMinHeight?: boolean;
}

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

export interface MotionProgress {
  progress: Progress;
  progressThreshold: SharedValue<number>;
}

export interface HeaderMotionBridgeValue extends MotionProgress {
  measureTotalHeight: MeasureAnimatedHeaderAndSet;
  measureDynamic: MeasureAnimatedHeaderAndSet;
  enableHeaderPan: boolean;
  headerPanMomentumOffset: SharedValue<number | null>;
  scrollValues: SharedValue<ScrollValues>;
  activeScrollId: SharedValue<string> | undefined;
  scrollToRef: React.RefObject<ScrollTo | null>;
  originalHeaderHeight: number;
}

export interface ScrollManagerHeaderMotionContext {
  originalHeaderHeight: number;
  contentContainerMinHeight?: number;
}

export interface ScrollManagerConfig<TRef extends InstanceOrElement = any> {
  scrollableProps: Pick<ScrollViewProps, 'onScroll' | 'onLayout'> & {
    refreshControl?: ReactElement;
    ref: AnimatedRef<TRef>;
  };
  headerMotionContext: ScrollManagerHeaderMotionContext;
}

export type ScrollTo = (y: number, options?: ScrollToOptions) => void;

export type ScrollHandlerContext = {
  lastOffset: number | undefined;
};

interface ScrollToOptions {
  isValueDelta?: boolean;
  animated?: boolean;
}
