import type { ReactNode } from 'react';
import { HeaderMotionContext } from '../context';
import type { HeaderMotionBridgeValue } from '../types';

export interface HeaderMotionNavigationBridgeProps {
  value: HeaderMotionBridgeValue;
  children: ReactNode;
}

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
