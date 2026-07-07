import {
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
} from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

// FIXME: Types are a mess here

const AnimatedRefreshControl = Animated.createAnimatedComponent(RefreshControl);

type MaybeShared<T> = T | SharedValue<T | undefined>;

export interface ResolveRefreshControlOptions {
  refreshControl?: MaybeShared<ReactElement<RefreshControlProps>>;
  refreshing?: MaybeShared<boolean>;
  onRefresh?: MaybeShared<() => void>;
  progressViewOffset: MaybeShared<number> | SharedValue<number>;
}

export function resolveRefreshControl({
  refreshControl,
  refreshing,
  onRefresh,
  progressViewOffset,
}: ResolveRefreshControlOptions):
  | ReactElement<
      RefreshControlProps | React.ComponentProps<typeof AnimatedRefreshControl>
    >
  | undefined {
  if (!refreshControl) {
    return createRefreshControlWithOffset({
      refreshing,
      onRefresh,
      progressViewOffset,
    });
  }

  return isValidElement<RefreshControlProps>(refreshControl)
    ? injectProgressViewOffset(refreshControl, progressViewOffset)
    : undefined;
}

function createRefreshControlWithOffset({
  refreshing,
  onRefresh,
  progressViewOffset,
}: Omit<ResolveRefreshControlOptions, 'refreshControl'>) {
  if (!onRefresh) {
    return undefined;
  }

  return createElement(ResolvedRefreshControl, {
    refreshing: (refreshing as boolean) ?? false,
    onRefresh: onRefresh as () => void,
    progressViewOffset: progressViewOffset as number,
  }) as ReactElement<RefreshControlProps>;
}

function injectProgressViewOffset(
  refreshControl: ReactElement<RefreshControlProps>,
  progressViewOffset: MaybeShared<number> | SharedValue<number>
) {
  const offset = refreshControl.props.progressViewOffset ?? progressViewOffset;

  if (!isSharedValue<number>(offset)) {
    return cloneElement(refreshControl, {
      progressViewOffset: offset as number,
    });
  }

  if (isHeadlessRefreshControl(refreshControl)) {
    // HeaderMotion.RefreshControl is headless — its native side never reads
    // progressViewOffset, so a SharedValue offset needs no resolving. Swapping
    // it for ResolvedRefreshControl would silently replace the headless
    // control with the built-in platform spinner.
    return refreshControl;
  }

  return createElement(ResolvedRefreshControl, {
    ...refreshControl.props,
    progressViewOffset: progressViewOffset as number,
  });
}

function isHeadlessRefreshControl(element: ReactElement<RefreshControlProps>) {
  return (
    (element.type as { isHeaderMotionRefreshControl?: boolean })
      ?.isHeaderMotionRefreshControl === true
  );
}

function ResolvedRefreshControl({
  refreshing,
  onRefresh,
  progressViewOffset,
  ...props
}: React.ComponentProps<typeof AnimatedRefreshControl>) {
  const animatedProps = useAnimatedProps<RefreshControlProps>(() => {
    return {
      ...(isSharedValue(refreshing) ? { refreshing: refreshing.value } : {}),
      ...(isSharedValue(onRefresh) ? { onRefresh: onRefresh.value } : {}),
      ...(isSharedValue(progressViewOffset)
        ? { progressViewOffset: progressViewOffset.value }
        : {}),
    };
  });

  const nonAnimatedProps = {
    ...(isSharedValue(refreshing) ? {} : { refreshing }),
    ...(isSharedValue(onRefresh) ? {} : { onRefresh }),
    ...(isSharedValue(progressViewOffset) ? {} : { progressViewOffset }),
  };

  return (
    <AnimatedRefreshControl
      {...props}
      {...nonAnimatedProps}
      refreshing={nonAnimatedProps.refreshing as boolean}
      animatedProps={animatedProps}
    />
  );
}

function isSharedValue<T>(
  value: MaybeShared<T> | SharedValue<T>
): value is SharedValue<T> {
  'worklet';
  return typeof value === 'object' && value !== null && 'value' in value;
}
