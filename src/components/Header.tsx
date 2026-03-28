import {
  Fragment,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { ViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { HeaderMotionContext, useHeaderMotionContextOrThrow } from '../context';
import { useHeaderMotionBridge } from '../hooks/useHeaderMotionBridge';
import type {
  HeaderMotionBridgeValue,
  HeaderPanDecayConfig,
  MotionProgress,
} from '../types';
import { HeaderPanBoundary, headerOverlayStyle } from './HeaderBase';

type HeaderRenderChildren = (value: HeaderMotionBridgeValue) => ReactNode;

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

export interface HeaderMotionBridgeProps {
  children: HeaderRenderChildren;
}

export interface HeaderMotionNavigationBridgeProps {
  value: HeaderMotionBridgeValue;
  children: ReactNode;
}

type HeaderComponent = ((props: HeaderProps) => ReactElement | null) & {
  Dynamic: typeof HeaderMotionHeaderDynamic;
};

export function HeaderMotionBridge({ children }: HeaderMotionBridgeProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.Bridge only accepts a render function as its child.'
    );
  }

  return children(useHeaderMotionBridge());
}

export function HeaderMotionNavigationBridge({
  value,
  children,
}: HeaderMotionNavigationBridgeProps) {
  return (
    <HeaderMotionContext.Provider value={value}>
      {children}
    </HeaderMotionContext.Provider>
  );
}

function HeaderMotionHeaderRoot(props: HeaderProps) {
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

export function HeaderMotionHeaderDynamic(props: HeaderDynamicProps) {
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

export const HeaderMotionHeader = Object.assign(HeaderMotionHeaderRoot, {
  Dynamic: HeaderMotionHeaderDynamic,
}) as HeaderComponent;

function composeOnLayoutHandlers(
  userHandler: ViewProps['onLayout'],
  internalHandler: ViewProps['onLayout']
) {
  return (e: Parameters<NonNullable<ViewProps['onLayout']>>[0]) => {
    internalHandler?.(e);
    userHandler?.(e);
  };
}

function resolveSlottableChild(componentName: string, child: ReactElement) {
  if (!isValidElement(child) || child.type === Fragment) {
    throw new Error(
      `${componentName} with \`asChild\` expects a single valid React element child that accepts \`onLayout\`.`
    );
  }

  return child as ReactElement<{
    onLayout?: ViewProps['onLayout'];
  }>;
}

function cloneWithOnLayout(
  child: ReactElement<{
    onLayout?: ViewProps['onLayout'];
  }>,
  onLayout: ViewProps['onLayout'],
  componentName: string
) {
  if (!isValidElement(child)) {
    throw new Error(
      `${componentName} with \`asChild\` expects a valid React element child.`
    );
  }

  return cloneElement(child, {
    onLayout: composeOnLayoutHandlers(child.props.onLayout, onLayout),
  });
}

export type { HeaderMotionBridgeValue, MotionProgress };
