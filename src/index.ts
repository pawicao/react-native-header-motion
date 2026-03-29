import {
  createHeaderMotionScrollable,
  Bridge,
  HeaderMotionContextProvider,
  FlatList,
  Header,
  NavigationBridge,
  ScrollManager,
  ScrollView,
  type CreateHeaderMotionScrollableOptions,
  type HeaderDynamicProps,
  type HeaderMotionBridgeProps,
  type HeaderMotionFlatListProps,
  type HeaderMotionNavigationBridgeProps,
  type HeaderMotionProps,
  type HeaderMotionScrollManagerProps,
  type HeaderMotionScrollableOwnProps,
  type HeaderMotionScrollViewProps,
  type HeaderProps,
} from './components';

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
const HeaderMotion = Object.assign(HeaderMotionContextProvider, {
  Header,
  Bridge,
  NavigationBridge,
  ScrollManager,
  ScrollView,
  FlatList,
});

export default HeaderMotion;
export * from './hooks';
export type * from './types';
export { createHeaderMotionScrollable };
export { Bridge, Header, NavigationBridge };
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
