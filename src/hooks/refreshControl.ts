import {
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
} from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

type MaybeShared<T> = T | SharedValue<T | undefined>;

export interface ResolveRefreshControlOptions {
  refreshControl?: MaybeShared<ReactElement<RefreshControlProps>>;
  refreshing?: MaybeShared<boolean>;
  onRefresh?: MaybeShared<() => void>;
  progressViewOffset: MaybeShared<number>;
}

function injectProgressViewOffset(
  refreshControl: ReactElement<RefreshControlProps>,
  progressViewOffset: MaybeShared<number>
) {
  if (refreshControl.props.progressViewOffset !== undefined) {
    return refreshControl;
  }

  return cloneElement(refreshControl, {
    progressViewOffset: progressViewOffset as number,
  });
}

export function resolveRefreshControl({
  refreshControl,
  refreshing,
  onRefresh,
  progressViewOffset,
}: ResolveRefreshControlOptions):
  | ReactElement<RefreshControlProps>
  | undefined {
  if (refreshControl) {
    return isValidElement<RefreshControlProps>(refreshControl)
      ? injectProgressViewOffset(refreshControl, progressViewOffset)
      : undefined;
  }

  if (!onRefresh) {
    return undefined;
  }

  return createElement(RefreshControl, {
    refreshing: (refreshing as boolean) ?? false,
    onRefresh: onRefresh as () => void,
    progressViewOffset: progressViewOffset as number,
  }) as unknown as ReactElement<RefreshControlProps>;
}
