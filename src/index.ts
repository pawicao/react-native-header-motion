import {
  createHeaderMotionScrollable,
  HeaderMotionBridge,
  HeaderMotionContextProvider,
  HeaderMotionFlatList,
  HeaderMotionHeader,
  HeaderMotionNavigationBridge,
  HeaderMotionScrollManager,
  HeaderMotionScrollView,
  type CreateHeaderMotionScrollableOptions,
  type HeaderDynamicProps,
  type HeaderMotionFlatListProps,
  type HeaderMotionBridgeProps,
  type HeaderMotionNavigationBridgeProps,
  type HeaderMotionProps,
  type HeaderMotionScrollManagerProps,
  type HeaderMotionScrollableOwnProps,
  type HeaderMotionScrollViewProps,
  type HeaderProps,
} from './components';
import type { ReactElement } from 'react';

/**
 * Compound component type for HeaderMotion.
 * Provides the main context provider and sub-components for building collapsible headers.
 */
type HeaderMotionComponent = {
  /** Main context provider component */
  <T extends string>(props: HeaderMotionProps<T>): ReactElement;
  /** Header container component with built-in measurement wiring. */
  Header: typeof HeaderMotionHeader;
  /** Render-prop bridge for navigation-installed headers. */
  Bridge: typeof HeaderMotionBridge;
  /** Context provider for navigation-installed headers. */
  NavigationBridge: typeof HeaderMotionNavigationBridge;
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
 *   <HeaderMotion.Bridge>
 *     {(value) => (
 *       <Stack.Screen
 *         options={{
 *           header: () => (
 *             <HeaderMotion.NavigationBridge value={value}>
 *               <MyAnimatedHeader />
 *             </HeaderMotion.NavigationBridge>
 *           ),
 *         }}
 *       />
 *     )}
 *   </HeaderMotion.Bridge>
 *   <HeaderMotion.ScrollView>
 *     <MyScrollableContent />
 *   </HeaderMotion.ScrollView>
 * </HeaderMotion>
 * ```
 */
const HeaderMotion = HeaderMotionContextProvider as HeaderMotionComponent;
HeaderMotion.Header = HeaderMotionHeader;
HeaderMotion.Bridge = HeaderMotionBridge;
HeaderMotion.NavigationBridge = HeaderMotionNavigationBridge;
HeaderMotion.ScrollManager = HeaderMotionScrollManager;
HeaderMotion.ScrollView = HeaderMotionScrollView;
HeaderMotion.FlatList = HeaderMotionFlatList;

export default HeaderMotion;
export * from './hooks';
export type * from './types';
export { createHeaderMotionScrollable };
export {
  HeaderMotionBridge as Bridge,
  HeaderMotionHeader as Header,
  HeaderMotionNavigationBridge as NavigationBridge,
};
export type {
  CreateHeaderMotionScrollableOptions,
  HeaderDynamicProps,
  HeaderMotionFlatListProps,
  HeaderMotionBridgeProps,
  HeaderMotionNavigationBridgeProps,
  HeaderMotionProps,
  HeaderMotionScrollManagerProps,
  HeaderMotionScrollableOwnProps,
  HeaderMotionScrollViewProps,
  HeaderProps,
};
