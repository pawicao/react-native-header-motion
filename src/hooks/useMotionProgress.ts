import { useContext } from 'react';
import { HeaderMotionContext } from '../context';
import type { MotionProgress } from '../types';

export function useMotionProgress(): MotionProgress {
  const ctxValue = useContext(HeaderMotionContext);
  if (!ctxValue) {
    throw new Error(
      'useMotionProgress must be used within a <HeaderMotion /> component. If using inside a navigation header, consider using <HeaderMotion.Header /> instead to ensure context access.'
    );
  }
  const { progress, measureTotal, measureDynamic, progressThreshold } =
    ctxValue;

  return {
    progress,
    measureTotal,
    measureDynamic,
    progressThreshold,
  };
}
