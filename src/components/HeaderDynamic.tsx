import type { ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useHeaderMotionContextOrThrow } from '../context';
import type { HeaderDynamicProps } from './Header';
import {
  cloneWithOnLayout,
  composeOnLayoutHandlers,
  resolveSlottableChild,
} from '../utils';

export function HeaderDynamic(props: HeaderDynamicProps) {
  const ctxValue = useHeaderMotionContextOrThrow(
    'HeaderMotion.Header.Dynamic must be used within <HeaderMotion /> or <HeaderMotion.NavigationBridge />. If you are rendering inside a navigation header, bridge the context with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
  );

  if (props.asChild) {
    return cloneWithOnLayout(
      resolveSlottableChild('HeaderMotion.Header.Dynamic', props.children),
      ctxValue.measureDynamic,
      'HeaderMotion.Header.Dynamic'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { asChild: _asChild, onLayout, ...rest } = props;
  const resolvedOnLayout = onLayout as ViewProps['onLayout'] | undefined;

  return (
    <Animated.View
      {...rest}
      onLayout={composeOnLayoutHandlers(
        resolvedOnLayout,
        ctxValue.measureDynamic
      )}
    />
  );
}
