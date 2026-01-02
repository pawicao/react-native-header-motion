import { useMotionProgress } from '../hooks/useMotionProgress';
import type { MotionProgress } from '../types';

type HeaderRenderChildren = (props: MotionProgress) => React.ReactNode;

export interface HeaderMotionHeaderProps {
  children: HeaderRenderChildren;
}

export function HeaderMotionHeader({ children }: HeaderMotionHeaderProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.Header only accepts render function as the only child.'
    );
  }

  const motionProgressProps = useMotionProgress();
  return children(motionProgressProps);
}
