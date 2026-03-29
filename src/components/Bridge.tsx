import { useHeaderMotionBridge } from '../hooks/useHeaderMotionBridge';
import type { ReactNode } from 'react';
import type { HeaderMotionBridgeValue } from '../types';

type HeaderRenderChildren = (value: HeaderMotionBridgeValue) => ReactNode;

export interface HeaderMotionBridgeProps {
  children: HeaderRenderChildren;
}

export function Bridge({ children }: HeaderMotionBridgeProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.Bridge only accepts a render function as its child.'
    );
  }

  return children(useHeaderMotionBridge());
}
