import { useHeaderMotionBridge } from '../hooks/useHeaderMotionBridge';
import type { ReactNode } from 'react';
import type { HeaderMotionBridgeValue } from '../types';

type HeaderRenderChildren = (value: HeaderMotionBridgeValue) => ReactNode;

export interface HeaderMotionBridgeProps {
  /**
   * Render function that receives the current HeaderMotion context value.
   *
   * Use this when you need to pass the library's context across a React tree
   * boundary, most commonly into a navigation-rendered header.
   */
  children: HeaderRenderChildren;
}

/**
 * Reads the current HeaderMotion context and exposes it through a render
 * function so it can be forwarded into another subtree.
 */
export function Bridge({ children }: HeaderMotionBridgeProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.Bridge only accepts a render function as its child.'
    );
  }

  return children(useHeaderMotionBridge());
}
