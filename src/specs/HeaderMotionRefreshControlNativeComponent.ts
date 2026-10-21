import { codegenNativeComponent, type ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Float,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

export type RefreshProgressEvent = Readonly<{
  progress: Float;
  pullDistance: Float;
  triggerDistance: Float;
  phase: Int32;
}>;

export interface NativeProps extends ViewProps {
  enabled?: WithDefault<boolean, true>;
  refreshing: boolean;
  progressViewOffset?: WithDefault<Float, 0>;
  triggerDistance?: WithDefault<Float, 80>;
  keepScrollContentPinned?: WithDefault<boolean, true>;
  refreshConfirmationTimeout?: WithDefault<Int32, 200>;
  progressSettleDuration?: WithDefault<Int32, 180>;
  onRefresh?: DirectEventHandler<null>;
  onRefreshProgress?: DirectEventHandler<RefreshProgressEvent>;
}

export default codegenNativeComponent<NativeProps>(
  'HeaderMotionRefreshControl'
);
