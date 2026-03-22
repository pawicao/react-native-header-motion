import Animated, {
  type FlatListPropsWithLayout,
} from 'react-native-reanimated';
import {
  createHeaderMotionScrollableComponent,
  type HeaderMotionScrollableOwnProps,
} from './createHeaderMotionScrollableComponent';

export type HeaderMotionFlatListProps<T = any> = FlatListPropsWithLayout<T> &
  HeaderMotionScrollableOwnProps<Animated.FlatList<T>>;

export const HeaderMotionFlatList = createHeaderMotionScrollableComponent(
  Animated.FlatList,
  {
    displayName: 'HeaderMotion.FlatList',
    contentContainerMode: 'renderScrollComponent',
    componentAnimation: 'assume-animated',
  }
);

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
