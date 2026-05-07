import { cloneElement, isValidElement, useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useHeaderMotionContextOrThrow } from '../context';
import type { HeaderSubHeaderProps } from '../types';
import { composeOnLayoutHandlers, resolveSlottableChild } from '../utils';
import { DEFAULT_SCROLL_ID } from '../utils/defaults';

const baseStyle = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  zIndex: 20,
};

export function SubHeader(props: HeaderSubHeaderProps) {
  const ctx = useHeaderMotionContextOrThrow(
    'HeaderMotion.SubHeader must be used within <HeaderMotion /> or <HeaderMotion.NavigationBridge />.'
  );
  const scrollId = props.scrollId ?? DEFAULT_SCROLL_ID;
  const topInset = props.topInset ?? 0;
  const staticHeight = props.height;

  const handleLayout: ViewProps['onLayout'] = (e) => {
    if (staticHeight !== undefined) {
      return;
    }
    ctx.setSubHeaderHeight(scrollId, e.nativeEvent.layout.height, topInset);
  };

  useEffect(() => {
    if (staticHeight === undefined) {
      return;
    }

    ctx.setSubHeaderHeight(scrollId, staticHeight, topInset);
  }, [ctx, scrollId, staticHeight, topInset]);

  const stickyStyle = useAnimatedStyle(() => {
    const collapsedHeaderHeight = Math.max(
      0,
      ctx.originalHeaderHeight - ctx.progressThreshold.get()
    );
    const currentHeaderHeight =
      ctx.originalHeaderHeight -
      ctx.progress.get() * (ctx.originalHeaderHeight - collapsedHeaderHeight);

    return {
      top: currentHeaderHeight + topInset,
    };
  }, [ctx.originalHeaderHeight, topInset]);

  if (props.asChild) {
    const child = resolveSlottableChild(
      'HeaderMotion.SubHeader',
      props.children
    );
    if (!isValidElement(child)) {
      return null;
    }
    const childAsAny = child as any;

    return cloneElement(childAsAny, {
      onLayout: composeOnLayoutHandlers(
        childAsAny.props.onLayout,
        handleLayout
      ),
      style: [childAsAny.props.style, baseStyle, stickyStyle],
    });
  }

  const { style, onLayout, ...rest } = props;
  const userOnLayout = onLayout as ViewProps['onLayout'] | undefined;

  return (
    <Animated.View
      {...rest}
      onLayout={composeOnLayoutHandlers(userOnLayout, handleLayout)}
      style={[baseStyle, stickyStyle, style]}
    />
  );
}
