import { useScrollManager } from '../hooks';
import type { ScrollManagerConfig } from '../types';
import type { ReactNode } from 'react';

type ScrollManagerRenderChildren = (
  scrollableProps: ScrollManagerConfig['scrollableProps'],
  options: ScrollManagerConfig['headerMotionContext']
) => ReactNode;

export interface HeaderMotionScrollManagerProps {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g., in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Render function that receives scroll props and header context.
   * Use this to create custom scroll implementations that integrate with HeaderMotion.
   */
  children: ScrollManagerRenderChildren;
}

/**
 * ScrollManager component that provides scroll tracking functionality for custom scroll implementations. Uses {@link useScrollManager} under the hood.
 * Must be used within a HeaderMotion component.
 *
 * This is useful when you need to use a scroll component that isn't directly supported
 * (like a custom scroll view or third-party list components).
 *
 * @example
 * ```tsx
 * <HeaderMotion>
 *   <HeaderMotion.ScrollManager>
 *     {(scrollableProps, { originalHeaderHeight }) => (
 *       <CustomScrollView {...scrollableProps}>
 *         <View style={{ paddingTop: originalHeaderHeight }}>
 *           <Text>Content</Text>
 *         </View>
 *       </CustomScrollView>
 *     )}
 *   </HeaderMotion.ScrollManager>
 * </HeaderMotion>
 * ```
 */
export function HeaderMotionScrollManager({
  children,
  scrollId,
}: HeaderMotionScrollManagerProps) {
  if (typeof children !== 'function') {
    throw new Error(
      'HeaderMotion.ScrollManager only accepts render function as the only child.'
    );
  }

  const { scrollableProps, headerMotionContext } = useScrollManager(scrollId);

  return children(scrollableProps, headerMotionContext);
}
