import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { LayoutChangeEvent, ScrollViewProps } from 'react-native';
import Animated, {
  type AnimatedProps,
  type AnimatedRef,
} from 'react-native-reanimated';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';
import { useScrollManager, type UseScrollManagerOptions } from '../hooks';
import type { HeaderMotionOffsetProps } from '../types';
import { resolveHeaderOffsetStyle } from '../utils';

export type HeaderMotionScrollableOwnProps<
  TRef extends InstanceOrElement = any
> = HeaderMotionOffsetProps & {
  /**
   * Unique identifier for this scrollable when one header is shared across
   * multiple scrollables.
   */
  scrollId?: string;
  /**
   * Animated ref to reuse instead of letting HeaderMotion create one.
   */
  animatedRef?: AnimatedRef<TRef> | AnimatedRef;
};

export interface CreateHeaderMotionScrollableOptions<
  TIsComponentAnimated extends boolean = boolean
> {
  displayName?: string;
  /**
   * If true, this function will NOT call Animated.createAnimatedComponent internally.
   * Useful when you are creating a HeaderMotionScrollable from lists that already export their
   * own (Re)animated components (e.g. LegendList).
   *
   * @default false
   */
  isComponentAnimated?: TIsComponentAnimated;
  /**
   * Controls how HeaderMotion injects content-container spacing.
   *
   * - `children`: wraps `children` in an inner `Animated.View`
   * - `renderScrollComponent`: injects a custom scroll component that wraps the content
   *
   * Use `children` for ScrollView-like components. Use
   * `renderScrollComponent` for FlatList-like components that own their
   * internal scroll container.
   *
   * @default 'renderScrollComponent'
   */
  contentContainerMode?: ContentContainerMode;
}

export function createHeaderMotionScrollable<
  TScrollableComponent extends ScrollableComponent,
  TIsComponentAnimated extends boolean = false
>(
  ScrollableComponent: TScrollableComponent,
  options?: CreateHeaderMotionScrollableOptions<TIsComponentAnimated>
): HeaderMotionScrollableComponent<TScrollableComponent, TIsComponentAnimated> {
  const {
    isComponentAnimated = false,
    contentContainerMode = 'renderScrollComponent',
    displayName = `HeaderMotion(${getDisplayName(
      ScrollableComponent as {
        displayName?: string;
        name?: string;
      }
    )})`,
  } = options || {};

  const AnimatedScrollable = (
    isComponentAnimated
      ? ScrollableComponent
      : Animated.createAnimatedComponent(ScrollableComponent)
  ) as ScrollableImplementationComponent;

  function HeaderMotionScrollable(props: ScrollableRuntimeProps) {
    const {
      scrollId,
      animatedRef,
      headerOffsetStrategy,
      ensureScrollableContentMinHeight = false,
      contentContainerStyle,
      refreshControl,
      refreshing,
      onRefresh,
      progressViewOffset,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      ...rest
    } = props;

    const { scrollableProps, headerMotionContext } = useScrollManager(
      scrollId,
      {
        refreshControl:
          (refreshControl as UseScrollManagerOptions['refreshControl']) ??
          undefined,
        refreshing: refreshing ?? undefined,
        onRefresh: onRefresh ?? undefined,
        progressViewOffset,
        onScroll,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollBegin,
        onMomentumScrollEnd,
        animatedRef,
        ensureScrollableContentMinHeight,
      }
    );

    const {
      onScroll: managedOnScroll,
      onLayout: managedOnLayout,
      refreshControl: managedRefreshControl,
      ref,
      ...scrollViewProps
    } = scrollableProps;
    const { originalHeaderHeight, contentContainerMinHeight } =
      headerMotionContext;

    const userOnLayoutRef = useRef<UserOnLayout>(rest.onLayout as UserOnLayout);
    useLayoutEffect(() => {
      userOnLayoutRef.current = rest.onLayout as UserOnLayout;
    });

    const managedContentContainerStyle = useMemo(
      () => [
        ensureScrollableContentMinHeight &&
        contentContainerMinHeight !== undefined
          ? { minHeight: contentContainerMinHeight }
          : undefined,
        resolveHeaderOffsetStyle(originalHeaderHeight, headerOffsetStrategy),
        contentContainerStyle,
      ],
      [
        contentContainerStyle,
        contentContainerMinHeight,
        ensureScrollableContentMinHeight,
        headerOffsetStrategy,
        originalHeaderHeight,
      ]
    );

    const refreshControlProps = managedRefreshControl && {
      refreshControl: managedRefreshControl,
    };

    const handleLayout = useCallback(
      (e: LayoutChangeEvent) => {
        managedOnLayout?.(e);
        userOnLayoutRef.current?.(e);
      },
      [managedOnLayout]
    );

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
        onLayout={handleLayout}
        onScroll={managedOnScroll}
      />
    );
  }

  const TypedHeaderMotionScrollable =
    HeaderMotionScrollable as HeaderMotionScrollableComponent<
      TScrollableComponent,
      TIsComponentAnimated
    >;

  TypedHeaderMotionScrollable.displayName = displayName;
  return TypedHeaderMotionScrollable;
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

type UserOnLayout = ScrollViewProps['onLayout'] | undefined;

// TODO: From here below Codex did some absolute TypeScript magic but it seems to work
// Having limited time, I can't spend more on adjusting this to make it less convoluted
// But what matters is that it seems that for the user the types work very well

type ContentContainerMode = 'children' | 'renderScrollComponent';

type ScrollableComponent =
  | ((props: any) => ReactElement | null)
  | (new (...args: any[]) => any);

declare const noListItemSymbol: unique symbol;
type NoListItem = { readonly [noListItemSymbol]: true };

type ScrollableComponentProps<TScrollableComponent> =
  TScrollableComponent extends new (props: infer TProps, ...args: any[]) => any
    ? TProps
    : TScrollableComponent extends (props: infer TProps, ...args: any[]) => any
    ? TProps
    : never;

type IsUnknown<TValue> = unknown extends TValue
  ? [keyof TValue] extends [never]
    ? true
    : false
  : false;

type ReplaceUnknownDeep<TValue, TReplacement> = IsUnknown<TValue> extends true
  ? TReplacement
  : TValue extends (...args: infer TArgs) => infer TResult
  ? (
      ...args: {
        [TIndex in keyof TArgs]: ReplaceUnknownDeep<
          TArgs[TIndex],
          TReplacement
        >;
      }
    ) => TResult
  : TValue extends readonly (infer TItem)[]
  ? readonly ReplaceUnknownDeep<TItem, TReplacement>[]
  : TValue extends object
  ? {
      [TKey in keyof TValue]: ReplaceUnknownDeep<TValue[TKey], TReplacement>;
    }
  : TValue;

type MaybeAnimatedProps<
  TProps extends object,
  TIsComponentAnimated
> = TIsComponentAnimated extends true ? TProps : AnimatedProps<TProps>;

type ResolveListItemProps<TProps extends object, TListItem> = [
  TListItem
] extends [NoListItem]
  ? TProps
  : ReplaceUnknownDeep<TProps, TListItem>;

type ExtractDataProp<TProps> = TProps extends { data?: infer TData }
  ? TData
  : TProps extends { data: infer TData }
  ? TData
  : never;

type ExtractListItemFromData<TData> = TData extends
  | ReadonlyArray<infer TItem>
  | null
  | undefined
  ? TItem
  : TData extends ArrayLike<infer TItem> | null | undefined
  ? TItem
  : never;

type HasGenericDataProp<TProps> = IsUnknown<
  ExtractListItemFromData<ExtractDataProp<TProps>>
>;

type ExtractRefTargetFromRef<TRef> = TRef extends Ref<infer TInstance>
  ? TInstance
  : TRef extends AnimatedRef<infer TInstance>
  ? TInstance
  : never;

type ExtractRefTargetFromProps<TProps> = TProps extends { ref?: infer TRef }
  ? ExtractRefTargetFromRef<TRef>
  : TProps extends { ref: infer TRef }
  ? ExtractRefTargetFromRef<TRef>
  : never;

type ResolveScrollableRefTarget<TScrollableComponent, TProps> = [
  ExtractRefTargetFromProps<TProps>
] extends [never]
  ? TScrollableComponent extends new (...args: any[]) => infer TInstance
    ? TInstance extends InstanceOrElement
      ? TInstance
      : any
    : any
  : ExtractRefTargetFromProps<TProps> extends InstanceOrElement
  ? ExtractRefTargetFromProps<TProps>
  : any;

type HeaderMotionScrollableBaseProps<
  TScrollableComponent extends ScrollableComponent,
  TIsComponentAnimated extends boolean,
  TListItem = NoListItem
> = ResolveListItemProps<
  MaybeAnimatedProps<
    ScrollableComponentProps<TScrollableComponent>,
    TIsComponentAnimated
  >,
  TListItem
>;

type HeaderMotionScrollablePublicProps<
  TScrollableComponent extends ScrollableComponent,
  TIsComponentAnimated extends boolean,
  TListItem = NoListItem
> = HeaderMotionScrollableBaseProps<
  TScrollableComponent,
  TIsComponentAnimated,
  TListItem
> &
  HeaderMotionScrollableOwnProps<
    ResolveScrollableRefTarget<
      TScrollableComponent,
      HeaderMotionScrollableBaseProps<
        TScrollableComponent,
        TIsComponentAnimated,
        TListItem
      >
    >
  >;

type HeaderMotionGenericScrollableComponent<
  TScrollableComponent extends ScrollableComponent,
  TIsComponentAnimated extends boolean
> = {
  <TListItem = any>(
    props: HeaderMotionScrollablePublicProps<
      TScrollableComponent,
      TIsComponentAnimated,
      TListItem
    >
  ): ReactElement | null;
  displayName?: string;
};

type HeaderMotionStaticScrollableComponent<
  TScrollableComponent extends ScrollableComponent,
  TIsComponentAnimated extends boolean
> = {
  (
    props: HeaderMotionScrollablePublicProps<
      TScrollableComponent,
      TIsComponentAnimated
    >
  ): ReactElement | null;
  displayName?: string;
};

type HeaderMotionScrollableComponent<
  TScrollableComponent extends ScrollableComponent,
  TIsComponentAnimated extends boolean
> = HasGenericDataProp<
  ScrollableComponentProps<TScrollableComponent>
> extends true
  ? HeaderMotionGenericScrollableComponent<
      TScrollableComponent,
      TIsComponentAnimated
    >
  : HeaderMotionStaticScrollableComponent<
      TScrollableComponent,
      TIsComponentAnimated
    >;

type ScrollableRuntimeProps = HeaderMotionScrollableOwnProps & {
  children?: ReactNode;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  onScroll?: ScrollViewProps['onScroll'];
  onScrollBeginDrag?: ScrollViewProps['onScrollBeginDrag'];
  onScrollEndDrag?: ScrollViewProps['onScrollEndDrag'];
  onMomentumScrollBegin?: ScrollViewProps['onMomentumScrollBegin'];
  onMomentumScrollEnd?: ScrollViewProps['onMomentumScrollEnd'];
  refreshControl?: ReactElement | null;
  refreshing?: UseScrollManagerOptions['refreshing'] | null;
  onRefresh?: UseScrollManagerOptions['onRefresh'] | null;
  progressViewOffset?: UseScrollManagerOptions['progressViewOffset'];
  [key: string]: unknown;
};

type ScrollableImplementationComponent = (
  props: ScrollableRuntimeProps
) => ReactElement | null;
