import type { ReactNode } from 'react';
import { HeaderMotionContext } from '../context';
import type { HeaderMotionBridgeValue } from '../types';

export interface HeaderMotionNavigationBridgeProps {
  /**
   * Previously captured HeaderMotion context value to re-provide in another
   * subtree.
   */
  value: HeaderMotionBridgeValue;
  /** Subtree that should regain access to HeaderMotion context. */
  children: ReactNode;
}

/**
 * Re-provides HeaderMotion context in a different part of the React tree.
 *
 * This is primarily useful for navigation libraries that render headers outside
 * the screen subtree where `HeaderMotion` itself lives.
 */
export function NavigationBridge({
  value,
  children,
}: HeaderMotionNavigationBridgeProps) {
  return (
    <HeaderMotionContext.Provider value={value}>
      {children}
    </HeaderMotionContext.Provider>
  );
}
