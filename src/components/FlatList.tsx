import type { ReactElement } from 'react';
import Animated, {
  type FlatListPropsWithLayout,
} from 'react-native-reanimated';
import {
  createHeaderMotionScrollable,
  type HeaderMotionScrollableOwnProps,
} from './createHeaderMotionScrollable';

export type HeaderMotionFlatListProps<T = any> = FlatListPropsWithLayout<T> &
  HeaderMotionScrollableOwnProps<Animated.FlatList<T>>;

type FlatListComponent = <T = any>(
  props: HeaderMotionFlatListProps<T>
) => ReactElement | null;

/**
 * Animated FlatList component that integrates with HeaderMotion.
 * Automatically handles scroll tracking and header animation synchronization.
 * Must be used within a HeaderMotion component.
 *
 * @template T - The type of items in the FlatList
 *
 * @example
 * ```tsx
 * <HeaderMotion>
 *   <HeaderMotion.FlatList
 *     data={items}
 *     renderItem={({ item }) => <Text>{item}</Text>}
 *   />
 * </HeaderMotion>
 * ```
 */
export const FlatList = createHeaderMotionScrollable(Animated.FlatList, {
  displayName: 'HeaderMotion.FlatList',
  contentContainerMode: 'renderScrollComponent',
  isComponentAnimated: true,
}) as FlatListComponent;
