import type { ReactElement } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { useHeaderMotionContextOrThrow } from '../context';
import type { HeaderPanDecayConfig } from '../types';
import {
  cloneWithOnLayout,
  composeOnLayoutHandlers,
  resolveSlottableChild,
} from '../utils';
import { HeaderDynamic } from './HeaderDynamic';
import { HeaderPanBoundary } from './HeaderPanBoundary';

type HeaderPanProps =
  | {
      /** Enables panning directly on the header surface.
       * @default false
       */
      pannable: true;
      /**
       * Custom momentum config used after a header pan ends.
       *
       * If you provide a function, it runs inside the gesture end worklet and
       * **must itself be a worklet-safe function**.
       */
      panDecayConfig?: HeaderPanDecayConfig;
    }
  | {
      pannable?: false | undefined;
      panDecayConfig?: never;
    };

type HeaderAsChildProps = {
  asChild: true;
  children: ReactElement;
};

type HeaderDefaultProps = AnimatedProps<ViewProps> & {
  asChild?: false;
};

export type HeaderProps =
  | (HeaderDefaultProps &
      HeaderPanProps & {
        overlay?: boolean;
        withGestureHandlerRootView?: boolean;
      })
  | (HeaderAsChildProps &
      HeaderPanProps & {
        withGestureHandlerRootView?: boolean;
      });

export type HeaderDynamicProps = HeaderDefaultProps | HeaderAsChildProps;

const headerOverlayStyle = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
}).overlay;

type HeaderComponent = ((props: HeaderProps) => ReactElement | null) & {
  Dynamic: typeof HeaderDynamic;
};

function HeaderRoot(props: HeaderProps) {
  const ctxValue = useHeaderMotionContextOrThrow(
    'HeaderMotion.Header must be used within <HeaderMotion /> or <HeaderMotion.NavigationBridge />. If you are rendering inside a navigation header, bridge the context with <HeaderMotion.Bridge /> and <HeaderMotion.NavigationBridge />.'
  );

  if (props.asChild) {
    const child = resolveSlottableChild('HeaderMotion.Header', props.children);

    return (
      <HeaderPanBoundary
        pannable={props.pannable}
        panDecayConfig={props.panDecayConfig}
        headerPanMomentumOffset={ctxValue.headerPanMomentumOffset}
        scrollToRef={ctxValue.scrollToRef}
        withGestureHandlerRootView={props.withGestureHandlerRootView}
      >
        {cloneWithOnLayout(
          child,
          ctxValue.measureTotalHeight,
          'HeaderMotion.Header'
        )}
      </HeaderPanBoundary>
    );
  }

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asChild: _asChild,
    overlay = true,
    pannable,
    panDecayConfig,
    onLayout,
    style,
    withGestureHandlerRootView,
    ...rest
  } = props;
  const resolvedOnLayout = onLayout as ViewProps['onLayout'] | undefined;

  return (
    <HeaderPanBoundary
      pannable={pannable}
      panDecayConfig={panDecayConfig}
      headerPanMomentumOffset={ctxValue.headerPanMomentumOffset}
      scrollToRef={ctxValue.scrollToRef}
      withGestureHandlerRootView={withGestureHandlerRootView}
    >
      <Animated.View
        {...rest}
        onLayout={composeOnLayoutHandlers(
          resolvedOnLayout,
          ctxValue.measureTotalHeight
        )}
        style={[overlay ? headerOverlayStyle : undefined, style]}
      />
    </HeaderPanBoundary>
  );
}

export const Header = Object.assign(HeaderRoot, {
  Dynamic: HeaderDynamic,
}) as HeaderComponent;
