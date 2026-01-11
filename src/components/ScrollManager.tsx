import { useScrollManager } from '../hooks';
import type { ScrollManagerConfig } from '../types';
import type { ReactNode } from 'react';

type ScrollManagerRenderChildren = (
  scrollableProps: ScrollManagerConfig['scrollableProps'],
  options: ScrollManagerConfig['headerContext']
) => ReactNode;

export interface HeaderMotionScrollManagerProps {
  scrollId?: string;
  children: ScrollManagerRenderChildren;
}

export function HeaderMotionScrollManager({
  children,
  scrollId,
}: HeaderMotionScrollManagerProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.ScrollManager only accepts render function as the only child.'
    );
  }

  const { scrollableProps, headerContext } = useScrollManager(scrollId);

  return children(scrollableProps, headerContext);
}

// TODO: Description of props and arguments in all the exported functions
