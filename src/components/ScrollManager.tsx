import { useScrollManager } from '../hooks';
import type { ScrollManagerConfig } from '../types';

type ScrollManagerRenderChildren = (
  scrollableProps: ScrollManagerConfig['scrollableProps'],
  options: ScrollManagerConfig['headerContext']
) => React.ReactNode;

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
