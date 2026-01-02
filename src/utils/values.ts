import type { ScrollValue } from '../types';

export function getInitialScrollValue(): ScrollValue {
  'worklet';
  return { min: 0, current: 0 };
}
