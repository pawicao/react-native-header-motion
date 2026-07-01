import type { ReactElement } from 'react';
import type {
  LayoutChangeEvent,
  ScrollViewProps,
  ViewProps,
} from 'react-native';
import type {
  AnimatedProps,
  AnimatedRef,
  DerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import { DEFAULT_SCROLL_ID } from './utils/defaults';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';
import type {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import type { WithDecayConfig } from 'react-native-reanimated';

export type Progress = SharedValue<number>;
export type HeaderMotionOffsetStrategy =
  | 'padding'
  | 'margin'
  | 'top'
  | 'translate'
  | 'none';

export interface HeaderMotionOffsetProps {
  /**
   * How the scrollable content should be pushed below the measured header.
   *
   * `padding` is the safest default for most screens. `margin`, `top`, and
   * `translate` can be useful when the scrollable or its children need a
   * different layout behavior.
   *
   * `top` and `translate` add bottom compensation so the end of the content
   * remains reachable.
   *
   * @default 'padding'
   */
  headerOffsetStrategy?: HeaderMotionOffsetStrategy;
  /**
   * Adds a minimum content height so scrollables with short content can still collapse the
   * header completely.
   *
   * **Experimental: this relies on extra layout measurement and may still be
   * refined.**
   *
   * Enable this when some screens do not have enough content to naturally
   * scroll through the full collapse distance.
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

export enum RefreshPhase {
  Idle = 0,
  Pulling = 1,
  Ready = 2,
  Refreshing = 3,
  Cancelling = 4,
  Finishing = 5,
  Disabled = 6,
}

export interface RefreshControlState {
  /**
   * Normalized pull progress. `1` means the refresh trigger distance has been
   * reached; values above `1` represent pull overshoot.
   */
  progress: SharedValue<number>;
  /** Raw pull distance in platform points/dp. */
  pullDistance: SharedValue<number>;
  /** Distance required to enter the ready-to-refresh phase. */
  triggerDistance: SharedValue<number>;
  /** Discrete lifecycle phase for custom refresh UI. */
  phase: SharedValue<RefreshPhase>;
  /** `max(0, progress - 1)` exposed for convenience. */
  overshoot: DerivedValue<number>;
  /** Convenience boolean derived from `phase === RefreshPhase.Refreshing`. */
  isRefreshing: DerivedValue<boolean>;
}

export type HeaderPanDecayEvent =
  GestureStateChangeEvent<PanGestureHandlerEventPayload>;

export type HeaderPanDecayConfig =
  | WithDecayConfig
  | ((event: HeaderPanDecayEvent) => WithDecayConfig);

export type HeaderAsChildProps = {
  asChild: true;
  children: ReactElement;
};

export type HeaderDefaultProps = AnimatedProps<ViewProps> & {
  asChild?: false;
};

export type HeaderDynamicProps = HeaderDefaultProps | HeaderAsChildProps;

export interface HeaderMotionBridgeValue extends MotionProgress {
  measureTotalHeight: MeasureAnimatedHeaderAndSet;
  measureDynamic: MeasureAnimatedHeaderAndSet;
  headerPanMomentumOffset: SharedValue<number | null>;
  refreshControl: RefreshControlState;
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
