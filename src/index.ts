import {
  AnimatedHeaderBase,
  HeaderBase,
  createHeaderMotionScrollable,
  HeaderMotionContextProvider,
  HeaderMotionFlatList,
  HeaderMotionHeader,
  HeaderMotionScrollManager,
  HeaderMotionScrollView,
  type CreateHeaderMotionScrollableOptions,
  type HeaderMotionFlatListProps,
  type HeaderMotionHeaderProps,
  type HeaderMotionProps,
  type HeaderMotionScrollManagerProps,
  type HeaderMotionScrollableOwnProps,
  type HeaderMotionScrollViewProps,
} from './components';
import type { ReactElement } from 'react';

/**
 * Compound component type for HeaderMotion.
 * Provides the main context provider and sub-components for building collapsible headers.
 */
type HeaderMotionComponent = {
  /** Main context provider component */
  <T extends string>(props: HeaderMotionProps<T>): ReactElement;
  /** Component for providing motion progress properties to animated headers.
   * Use to pass props to the header components in React Navigation / Expo Router, which cannot access HeaderMotion's context and `useMotionProgress` otherwise.
   */
  Header: typeof HeaderMotionHeader;
  /** Component for custom scroll implementations.
   * Use when you want render-prop composition instead of calling {@link useScrollManager} directly.
   */
  ScrollManager: typeof HeaderMotionScrollManager;
  /** Animated ScrollView component with header motion integration */
  ScrollView: typeof HeaderMotionScrollView;
  /** Animated FlatList component with header motion integration */
  FlatList: typeof HeaderMotionFlatList;
};

/**
 * Main HeaderMotion component.
 * A compound component that provides context for collapsible header animations.
 *
 * @example
 * ```tsx
 * <HeaderMotion>
 *   <HeaderMotion.Header>
 *     {(headerProps) => (
 *       <Stack.Screen
 *         options={{
 *           header: () => (
 *             <MyAnimatedHeader {...headerProps} />
 *           ),
 *         }}
 *       />
 *     )}
 *   </HeaderMotion.Header>
 *   <HeaderMotion.ScrollView>
 *     <MyScrollableContent />
 *   </HeaderMotion.ScrollView>
 * </HeaderMotion>
 * ```
 */
const HeaderMotion = HeaderMotionContextProvider as HeaderMotionComponent;
HeaderMotion.Header = HeaderMotionHeader;
HeaderMotion.ScrollManager = HeaderMotionScrollManager;
HeaderMotion.ScrollView = HeaderMotionScrollView;
HeaderMotion.FlatList = HeaderMotionFlatList;

export default HeaderMotion;
export * from './hooks';
export type * from './types';
export { AnimatedHeaderBase, HeaderBase };
export { createHeaderMotionScrollable };
export type {
  CreateHeaderMotionScrollableOptions,
  HeaderMotionFlatListProps,
  HeaderMotionHeaderProps,
  HeaderMotionProps,
  HeaderMotionScrollManagerProps,
  HeaderMotionScrollableOwnProps,
  HeaderMotionScrollViewProps,
};
