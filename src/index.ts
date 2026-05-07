import {
  createHeaderMotionScrollable,
  Bridge,
  HeaderMotionContextProvider,
  FlatList,
  Header,
  NavigationBridge,
  ScrollManager,
  ScrollView,
  SubHeader,
  type CreateHeaderMotionScrollableOptions,
  type HeaderProps,
  type HeaderMotionBridgeProps,
  type HeaderMotionFlatListProps,
  type HeaderMotionNavigationBridgeProps,
  type HeaderMotionProps,
  type HeaderMotionScrollManagerProps,
  type HeaderMotionScrollableOwnProps,
  type HeaderMotionScrollViewProps,
} from './components';
import type { HeaderDynamicProps, HeaderSubHeaderProps } from './types';

type HeaderMotionCompound = typeof HeaderMotionContextProvider & {
  /**
   * Header container that measures the total header height and can optionally
   * make the header surface pannable.
   *
   * Use `HeaderMotion.Header.Dynamic` inside it to mark the part of the header
   * that should define the collapse distance.
   */
  Header: typeof Header;
  /**
   * Captures the current HeaderMotion context and exposes it through a render
   * function so it can be forwarded across a React tree boundary.
   *
   * This is primarily useful for navigation-rendered headers.
   */
  Bridge: typeof Bridge;
  /**
   * Re-provides a previously captured HeaderMotion context value in another
   * subtree.
   *
   * This is primarily useful for navigation libraries that render headers
   * outside the screen subtree where `HeaderMotion` lives.
   */
  NavigationBridge: typeof NavigationBridge;
  /**
   * Render-prop wrapper for managing a custom scrollable.
   *
   * Prefer `createHeaderMotionScrollable()` for most custom integrations. Use
   * `ScrollManager` only when the factory approach is not flexible enough.
   */
  ScrollManager: typeof ScrollManager;
  /**
   * Pre-wired `Animated.ScrollView` that participates in HeaderMotion's scroll
   * tracking and header offsetting.
   */
  ScrollView: typeof ScrollView;
  /**
   * Pre-wired `Animated.FlatList` that participates in HeaderMotion's scroll
   * tracking and header offsetting.
   */
  FlatList: typeof FlatList;
  /**
   * Tab/page-local sticky sub-header that pins below the collapsing header.
   *
   * It measures its own height and HeaderMotion scrollables automatically add
   * top spacing for the matching `scrollId`.
   */
  SubHeader: typeof SubHeader;
};

/**
 * Main HeaderMotion component.
 * Root provider and compound entrypoint for the library.
 *
 * It tracks header measurements, derives the shared `progress` value, and
 * exposes the pre-wired subcomponents used to connect headers and scrollables.
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
const HeaderMotion: HeaderMotionCompound = Object.assign(
  HeaderMotionContextProvider,
  {
    Header,
    Bridge,
    NavigationBridge,
    ScrollManager,
    ScrollView,
    FlatList,
    SubHeader,
  }
);

export default HeaderMotion;
export * from './hooks';
export { ScrollablePresets } from './utils/presets';
export type * from './types';
export { createHeaderMotionScrollable };
export { Bridge, Header, NavigationBridge };
export type {
  CreateHeaderMotionScrollableOptions,
  HeaderDynamicProps,
  HeaderSubHeaderProps,
  HeaderMotionFlatListProps,
  HeaderMotionBridgeProps,
  HeaderMotionNavigationBridgeProps,
  HeaderMotionProps,
  HeaderMotionScrollManagerProps,
  HeaderMotionScrollableOwnProps,
  HeaderMotionScrollViewProps,
  HeaderProps,
};
