import {
  forwardRef,
  useMemo,
  useCallback,
  type ComponentRef,
  type ReactNode,
  type ComponentType,
  type ComponentProps,
} from 'react';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { useScrollManager } from '../hooks';
import type { ScrollViewProps } from 'react-native';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';

export type HeaderMotionScrollableOwnProps<
  TRef extends InstanceOrElement = any
> = {
  /**
   * Optional unique identifier for this scroll view.
   * Use this when you have multiple scroll views (e.g. in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Optional animated ref to use for the scroll view.
   * When provided, the scroll manager will use this ref instead of creating its own.
   */
  animatedRef?: AnimatedRef<TRef> | AnimatedRef;
};

type ContentContainerMode = 'children' | 'renderScrollComponent';

export interface CreateHeaderMotionScrollableOptions {
  displayName?: string;
  /**
   * If true, this function will NOT call Animated.createAnimatedComponent internally.
   * Useful when you are creating a HeaderMotionScrollable from lists that already export their
   * own (Re)animated components (e.g. LegendList).
   *
   * @default false
   */
  isComponentAnimated?: boolean;
  /**
   * Strategy used to apply header spacing and min-height handling.
   * - `children`: wraps `children` in an inner `Animated.View`
   * - `renderScrollComponent`: injects a custom scroll component that wraps the content
   *
   * Use `renderScrollComponent` for FlatList-like implementations.
   *
   * @default 'renderScrollComponent'
   */
  contentContainerMode?: ContentContainerMode;
}

export function createHeaderMotionScrollable<
  TScrollableComponent extends ComponentType
>(
  ScrollableComponent: TScrollableComponent,
  options?: CreateHeaderMotionScrollableOptions
) {
  const {
    isComponentAnimated = false,
    contentContainerMode = 'children',
    displayName = `HeaderMotion(${getDisplayName(ScrollableComponent)})`,
  } = options || {};

  const AnimatedScrollable = (
    isComponentAnimated
      ? ScrollableComponent
      : Animated.createAnimatedComponent(ScrollableComponent)
  ) as ComponentType<
    ComponentProps<typeof Animated.FlatList> & HeaderMotionScrollableOwnProps
  >;

  // TODO: Instead of accepting animatedRef just accept ref and type it to be animated ref? idk

  function HeaderMotionScrollable(
    props: ComponentProps<TScrollableComponent> &
      HeaderMotionScrollableOwnProps<TScrollableComponent>
  ) {
    const {
      scrollId,

      contentContainerStyle,
      animatedRef,

      // headerOffsetStrategy,
      // ensureScrollableContentMinHeight = true,

      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      ...rest
    } = props as unknown as ComponentProps<typeof Animated.FlatList> &
      HeaderMotionScrollableOwnProps &
      Pick<ScrollViewProps, 'children'>;
    // TODO: Typing in this file probably could be much better

    const { scrollableProps, headerMotionContext } = useScrollManager(
      scrollId,
      {
        refreshControl: rest.refreshControl,
        refreshing: rest.refreshing,
        onRefresh: rest.onRefresh,
        progressViewOffset: rest.progressViewOffset,
        onScroll,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollBegin,
        onMomentumScrollEnd,
        animatedRef,
      }
    );

    const {
      onScroll: managedOnScroll,
      refreshControl: managedRefreshControl,
      ref,
      ...scrollViewProps
    } = scrollableProps;
    const { originalHeaderHeight, minHeightContentContainerStyle } =
      headerMotionContext;

    const managedContentContainerStyle = useMemo(
      () => [
        minHeightContentContainerStyle,
        { paddingTop: originalHeaderHeight },
        contentContainerStyle,
      ],
      [
        contentContainerStyle,
        minHeightContentContainerStyle,
        originalHeaderHeight,
      ]
    );

    const refreshControlProps = managedRefreshControl && {
      refreshControl: managedRefreshControl,
    };

    const contentContainerProps = useContentContainerProps({
      children: rest.children,
      mode: contentContainerMode,
      style: managedContentContainerStyle,
    });

    return (
      <AnimatedScrollable
        {...scrollViewProps}
        {...rest}
        {...refreshControlProps}
        {...contentContainerProps}
        ref={ref}
        onScroll={managedOnScroll}
      />
    );
  }

  HeaderMotionScrollable.displayName = displayName;
  return HeaderMotionScrollable;
}

function useContentContainerProps({
  children: rawChildren,
  mode,
  style,
}: {
  children?: ReactNode;
  mode: ContentContainerMode;
  style?: any;
}) {
  const renderScrollComponent = useCallback(
    (props: ScrollViewProps) => (
      <AnimatedScrollContainer {...props} contentContainerStyle={style} />
    ),
    [style]
  );

  const children = <Animated.View style={style}>{rawChildren}</Animated.View>;

  if (mode === 'children') {
    return { children };
  }

  return {
    renderScrollComponent,
  };
}

const AnimatedScrollContainer = forwardRef<
  ComponentRef<typeof Animated.ScrollView>,
  ScrollViewProps
>(({ children, contentContainerStyle, ...rest }, ref) => {
  return (
    <Animated.ScrollView {...rest} ref={ref}>
      <Animated.View style={contentContainerStyle}>{children}</Animated.View>
    </Animated.ScrollView>
  );
});

function getDisplayName(ScrollableComponent: {
  displayName?: string;
  name?: string;
}) {
  return (
    ScrollableComponent.displayName ?? ScrollableComponent.name ?? 'Scrollable'
  );
}
