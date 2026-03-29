import { StyleSheet, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useHeaderMotionContextOrThrow } from '../context';
import type {
  HeaderAsChildProps,
  HeaderDefaultProps,
  HeaderPanDecayConfig,
} from '../types';
import {
  cloneWithOnLayout,
  composeOnLayoutHandlers,
  resolveSlottableChild,
} from '../utils';
import { HeaderDynamic } from './HeaderDynamic';
import { HeaderPanBoundary } from './HeaderPanBoundary';

type HeaderPanProps =
  | {
      /** Enables dragging the header itself to scroll the active scrollable.
       *
       * This is useful when the header covers a large portion of the screen
       * and you want the gesture to feel continuous between header and content.
       *
       * @default false
       */
      pannable: true;
      /**
       * Customizes the momentum animation that runs after a header pan ends.
       *
       * Use an object for a fixed decay profile. Use a function when the decay
       * should depend on the end event, for example to dampen or amplify
       * certain velocities.
       *
       * If you provide a function, it runs inside the gesture end worklet and
       * **must itself be marked with the 'worklet' directive.**
       */
      panDecayConfig?: HeaderPanDecayConfig;
    }
  | {
      pannable?: false | undefined;
      panDecayConfig?: never;
    };

export type HeaderProps =
  | (HeaderDefaultProps &
      HeaderPanProps & {
        /**
         * Applies the default absolute-positioned header layout.
         *
         * Leave this enabled for navigation headers and any header that should
         * visually float above the scrollable content. Disable it only when you
         * intentionally want the header to participate in normal layout flow.
         *
         * @default true
         */
        overlay?: boolean;
        /**
         * Wraps the pan gesture in `GestureHandlerRootView`.
         *
         * Only use this when the rendered header subtree is not already under a
         * gesture-handler root.
         *
         * @default false
         */
        withGestureHandlerRootView?: boolean;
      })
  | (HeaderAsChildProps &
      HeaderPanProps & {
        /**
         * Wraps the pan gesture in `GestureHandlerRootView`.
         *
         * Only use this when the rendered header subtree is not already under a
         * gesture-handler root.
         *
         * @default false
         */
        withGestureHandlerRootView?: boolean;
      });

const headerOverlayStyle = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
}).overlay;

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

/**
 * Header container that measures the total header height for scroll offsetting.
 *
 * It renders an `Animated.View` by default, wires the outer header measurement
 * automatically, and can optionally make the header surface pannable.
 *
 * Pair it with `Header.Dynamic` to mark the part of the header that should
 * drive the collapse threshold.
 */
export const Header = Object.assign(HeaderRoot, {
  /**
   * Marks the part of the header whose measured layout should define the
   * collapsible distance.
   *
   * In most designs, this is the section that visually disappears while the
   * header collapses. Its measured value feeds `measureDynamic`, which can in
   * turn drive `progressThreshold`.
   */
  Dynamic: HeaderDynamic,
});
