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
  progressViewOffset: number;
}

function injectProgressViewOffset(
  refreshControl: ReactElement<RefreshControlProps>,
  progressViewOffset: number
) {
  if (refreshControl.props.progressViewOffset !== undefined) {
    return refreshControl;
  }

  return cloneElement(refreshControl, { progressViewOffset });
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
    progressViewOffset,
  }) as unknown as ReactElement<RefreshControlProps>;
}
