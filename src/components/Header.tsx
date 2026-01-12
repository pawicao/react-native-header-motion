import { useMotionProgress } from '../hooks/useMotionProgress';
import type { MotionProgress } from '../types';
import type { ReactNode } from 'react';

type HeaderRenderChildren = (props: MotionProgress) => ReactNode;

export interface HeaderMotionHeaderProps {
  /**
   * Render function that receives motion progress props.
   * Use this to animate your header based on scroll progress and to provide measurement functions to the elements of the header.
   */
  children: HeaderRenderChildren;
}

/**
 * Header component for providing motion progress properties to animated headers.
 * Must be used within a HeaderMotion component.
 *
 * Use to pass props to the header components in React Navigation / Expo Router, which cannot access HeaderMotion's context and `useMotionProgress` otherwise.`
 */
export function HeaderMotionHeader({ children }: HeaderMotionHeaderProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.Header only accepts render function as the only child.'
    );
  }

  const motionProgressProps = useMotionProgress();
  return children(motionProgressProps);
}
