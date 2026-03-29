import {
  Fragment,
  cloneElement,
  isValidElement,
  type ReactElement,
} from 'react';
import type { ViewProps } from 'react-native';

export type SlottableElementProps = {
  onLayout?: ViewProps['onLayout'];
};

export type SlottableElement = ReactElement<SlottableElementProps>;

export function composeOnLayoutHandlers(
  userHandler: ViewProps['onLayout'],
  internalHandler: ViewProps['onLayout']
) {
  return (e: Parameters<NonNullable<ViewProps['onLayout']>>[0]) => {
    internalHandler?.(e);
    userHandler?.(e);
  };
}

export function resolveSlottableChild(
  componentName: string,
  child: ReactElement
) {
  if (!isValidElement(child) || child.type === Fragment) {
    throw new Error(
      `${componentName} with \`asChild\` expects a single valid React element child that accepts \`onLayout\`.`
    );
  }

  return child as SlottableElement;
}

export function cloneWithOnLayout(
  child: SlottableElement,
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
