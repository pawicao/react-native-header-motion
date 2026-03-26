import type {
  HeaderMotionOffsetStrategy,
  MeasureAnimatedHeader,
  ProgressThreshold,
} from '../types';

const DEFAULT_PROGRESS_THRESHOLD: ProgressThreshold = (measuredHeaderValue) =>
  measuredHeaderValue;
const DEFAULT_MEASURE_DYNAMIC: MeasureAnimatedHeader = (e) =>
  e.nativeEvent.layout.height;
const DEFAULT_HEADER_OFFSET_STRATEGY: HeaderMotionOffsetStrategy = 'padding';

// Symbol doesn't work?
// const DEFAULT_SCROLL_ID = Symbol("HEADER_MOTION_DEFAULT_SCROLL_ID");
const DEFAULT_SCROLL_ID = '__HEADER_MOTION_DEFAULT_SCROLL_ID__';

export {
  DEFAULT_HEADER_OFFSET_STRATEGY,
  DEFAULT_MEASURE_DYNAMIC,
  DEFAULT_PROGRESS_THRESHOLD,
  DEFAULT_SCROLL_ID,
};
