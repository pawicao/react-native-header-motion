import {
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
} from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';

interface ResolveRefreshControlOptions {
  refreshControl?: ReactElement<RefreshControlProps>;
  refreshing?: boolean;
  onRefresh?: () => void;
  progressViewOffset: number;
}

function injectProgressViewOffset(
  refreshControl: ReactElement<RefreshControlProps>,
  progressViewOffset: number
) {
  if (refreshControl.props.progressViewOffset != null) {
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
    refreshing: refreshing ?? false,
    onRefresh,
    progressViewOffset,
  });
}
