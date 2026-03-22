import {
  createElement,
  forwardRef,
  type ComponentProps,
  type ComponentRef,
  type ComponentType,
  type ReactNode,
  type ReactElement,
  type Ref,
} from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import { useScrollManager, type UseScrollManagerOptions } from '../hooks';
import type { ScrollManagerConfig } from '../types';
import type { InstanceOrElement } from 'react-native-reanimated/lib/typescript/commonTypes';

export interface HeaderMotionScrollableOwnProps<
  TRef extends InstanceOrElement = any
> {
  /**
   * Optional unique identifier for this scrollable.
   * Use this when you have multiple scrollables (e.g. in tabs) to track them separately.
   */
  scrollId?: string;
  /**
   * Optional animated ref to use for the scrollable.
   * When provided, the scroll manager will use this ref instead of creating its own.
   */
  animatedRef?: AnimatedRef<TRef> | AnimatedRef;
}

export type HeaderMotionScrollableProps<
  TProps extends object,
  TRef extends InstanceOrElement = any
> = Omit<TProps, 'ref' | 'renderScrollComponent'> &
  HeaderMotionScrollableOwnProps<TRef>;

export type HeaderMotionContentContainerMode =
  | 'children'
  | 'renderScrollComponent';

export type HeaderMotionAnimatedRefTarget = 'component' | 'scrollComponent';
export type HeaderMotionComponentAnimationMode =
  | 'auto'
  | 'wrap'
  | 'assume-animated';

export interface CreateHeaderMotionScrollableComponentOptions {
  /**
   * Display name used for React DevTools.
   */
  displayName?: string;
  /**
   * Strategy used to apply header spacing and min-height handling.
   * - `children`: wraps `children` in an inner `Animated.View`
   * - `renderScrollComponent`: injects a custom scroll component that wraps the content
   *
   * Use `renderScrollComponent` for FlatList-like implementations.
   *
   * @default 'children'
   */
  contentContainerMode?: HeaderMotionContentContainerMode;
  /**
   * Where the managed animated ref should be attached.
   * Use `scrollComponent` for integrations whose actual scrollable ref lives inside `renderScrollComponent`.
   *
   * @default 'component'
   */
  animatedRefTarget?: HeaderMotionAnimatedRefTarget;
  /**
   * Controls whether the provided component should be wrapped with
   * `Animated.createAnimatedComponent()`.
   *
   * - `auto`: wrap only when the managed animated ref targets the outer component
   * - `wrap`: always wrap the provided component
   * - `assume-animated`: never wrap the provided component
   *
   * Use `assume-animated` when you pass an already animated component, such as
   * `Animated.ScrollView` or `Animated.FlatList`.
   *
   * @default 'auto'
   */
  componentAnimation?: HeaderMotionComponentAnimationMode;
}

type SupportedScrollableProps<TRef extends InstanceOrElement = any> =
  HeaderMotionScrollableOwnProps<TRef> & {
    children?: ReactNode;
    contentContainerStyle?: StyleProp<ViewStyle>;
  } & Pick<
      UseScrollManagerOptions<TRef>,
      | 'refreshControl'
      | 'refreshing'
      | 'onRefresh'
      | 'progressViewOffset'
      | 'onScroll'
      | 'onScrollBeginDrag'
      | 'onScrollEndDrag'
      | 'onMomentumScrollBegin'
      | 'onMomentumScrollEnd'
    >;

type AnySupportedScrollableComponent =
  | (ComponentType<any> & {
      displayName?: string;
      name?: string;
    })
  | (((props: any) => any) & {
      displayName?: string;
      name?: string;
    })
  | ((new (props: any) => any) & {
      displayName?: string;
      name?: string;
    });

type IsAny<TValue> = 0 extends 1 & TValue ? true : false;

type IsUnknown<TValue> = IsAny<TValue> extends true
  ? false
  : unknown extends TValue
  ? [TValue] extends [unknown]
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

type ShouldReplaceUnknownForKey<TKey extends PropertyKey> = TKey extends string
  ? TKey extends
      | 'data'
      | 'items'
      | 'keyExtractor'
      | 'CellRendererComponentStyle'
      | 'viewabilityConfigCallbackPairs'
    ? true
    : Lowercase<TKey> extends `${string}item${string}`
    ? true
    : false
  : false;

type ReplaceUnknownInScrollableProps<TProps extends object, TItem> = {
  [TKey in keyof TProps]: ShouldReplaceUnknownForKey<TKey> extends true
    ? ReplaceUnknownDeep<TProps[TKey], TItem>
    : TProps[TKey];
};

type HasGenericItemSignature<TScrollableComponent> =
  TScrollableComponent extends {
    <TItem = any>(props: any, itemTypeHint?: TItem): any;
  }
    ? true
    : TScrollableComponent extends {
        new <TItem = any>(props: any, itemTypeHint?: TItem): any;
      }
    ? true
    : false;

type HeaderMotionifiedScrollableComponent<
  TScrollableComponent,
  TRef extends InstanceOrElement
> = TScrollableComponent extends ComponentType<infer TProps extends object>
  ? HasGenericItemSignature<TScrollableComponent> extends true
    ? <TItem = any>(
        props: HeaderMotionScrollableProps<
          ReplaceUnknownInScrollableProps<TProps, TItem>,
          TRef
        >
      ) => ReactElement<any, any>
    : (
        props: HeaderMotionScrollableProps<TProps, TRef>
      ) => ReactElement<any, any>
  : never;

type InferDefaultAnimatedRefTarget<TScrollableComponent> =
  TScrollableComponent extends ComponentType<any>
    ? [ComponentRef<TScrollableComponent>] extends [never]
      ? InstanceOrElement
      : Extract<ComponentRef<TScrollableComponent>, InstanceOrElement>
    : InstanceOrElement;

function getDisplayName(ScrollableComponent: {
  displayName?: string;
  name?: string;
}) {
  return (
    ScrollableComponent.displayName ?? ScrollableComponent.name ?? 'Scrollable'
  );
}

function getManagedScrollableProps<TRef extends InstanceOrElement>(
  scrollableProps: ScrollManagerConfig<TRef>['scrollableProps'],
  includeRef: boolean
) {
  return {
    onScroll: scrollableProps.onScroll,
    scrollEventThrottle: scrollableProps.scrollEventThrottle,
    ...(includeRef && {
      ref: scrollableProps.ref,
    }),
    ...(scrollableProps.refreshControl && {
      refreshControl: scrollableProps.refreshControl,
    }),
  };
}

function resolveScrollableComponent(
  ScrollableComponent: AnySupportedScrollableComponent,
  animatedRefTarget: HeaderMotionAnimatedRefTarget,
  componentAnimation: HeaderMotionComponentAnimationMode
) {
  if (componentAnimation === 'assume-animated') {
    return ScrollableComponent;
  }

  if (
    componentAnimation === 'wrap' ||
    (componentAnimation === 'auto' && animatedRefTarget === 'component')
  ) {
    return Animated.createAnimatedComponent(
      ScrollableComponent as ComponentType<any>
    );
  }

  return ScrollableComponent;
}

export function createHeaderMotionScrollableComponent<
  TScrollableComponent extends AnySupportedScrollableComponent,
  TRef extends InstanceOrElement = InferDefaultAnimatedRefTarget<TScrollableComponent>
>(
  ScrollableComponent: TScrollableComponent,
  {
    displayName = `HeaderMotion(${getDisplayName(ScrollableComponent)})`,
    contentContainerMode = 'children',
    animatedRefTarget = 'component',
    componentAnimation = 'auto',
  }: CreateHeaderMotionScrollableComponentOptions = {}
): HeaderMotionifiedScrollableComponent<TScrollableComponent, TRef> {
  const ResolvedScrollableComponent = resolveScrollableComponent(
    ScrollableComponent,
    animatedRefTarget,
    componentAnimation
  );

  function HeaderMotionScrollableComponent(
    props: HeaderMotionScrollableProps<any, TRef>
  ) {
    const {
      scrollId,
      animatedRef,
      children,
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
      ...restProps
    } = props as SupportedScrollableProps<TRef>;

    const { scrollableProps, headerMotionContext } = useScrollManager<TRef>(
      scrollId,
      {
        animatedRef: animatedRef as AnimatedRef<TRef>,
        refreshControl,
        refreshing,
        onRefresh,
        progressViewOffset,
        onScroll,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollBegin,
        onMomentumScrollEnd,
      }
    );

    const { originalHeaderHeight, minHeightContentContainerStyle } =
      headerMotionContext;
    const managedProps = getManagedScrollableProps(
      scrollableProps,
      animatedRefTarget === 'component'
    );
    const contentContainerStyles = [
      minHeightContentContainerStyle,
      { paddingTop: originalHeaderHeight } as const,
      contentContainerStyle,
    ] as unknown as ScrollViewProps['contentContainerStyle'];
    const childContainerStyle = [
      minHeightContentContainerStyle,
      { paddingTop: originalHeaderHeight } as const,
      contentContainerStyle,
    ] as ComponentProps<typeof Animated.View>['style'];

    if (contentContainerMode === 'renderScrollComponent') {
      return createElement(ResolvedScrollableComponent as ComponentType<any>, {
        ...restProps,
        ...(managedProps as object),
        renderScrollComponent: (scrollComponentProps: ScrollViewProps) => (
          <AnimatedScrollContainer
            {...scrollComponentProps}
            contentContainerStyle={contentContainerStyles}
            managedRef={
              animatedRefTarget === 'scrollComponent'
                ? (scrollableProps.ref as unknown as AnimatedRef<
                    ComponentRef<typeof Animated.ScrollView>
                  >)
                : undefined
            }
          />
        ),
      });
    }

    return createElement(
      ResolvedScrollableComponent as ComponentType<any>,
      {
        ...restProps,
        ...(managedProps as object),
      },
      <Animated.View style={childContainerStyle}>{children}</Animated.View>
    );
  }

  HeaderMotionScrollableComponent.displayName = displayName;

  return HeaderMotionScrollableComponent as unknown as HeaderMotionifiedScrollableComponent<
    TScrollableComponent,
    TRef
  >;
}

type AnimatedScrollContainerProps = ScrollViewProps & {
  managedRef?:
    | AnimatedRef<ComponentRef<typeof Animated.ScrollView>>
    | AnimatedRef;
};

const AnimatedScrollContainer = forwardRef<
  ComponentRef<typeof Animated.ScrollView>,
  AnimatedScrollContainerProps
>(({ children, contentContainerStyle, managedRef, ...rest }, ref) => {
  return (
    <Animated.ScrollView
      {...rest}
      ref={(node: ComponentRef<typeof Animated.ScrollView> | null) => {
        setRef(ref, node);
        setRef(managedRef, node);
      }}
    >
      <Animated.View style={contentContainerStyle}>{children}</Animated.View>
    </Animated.ScrollView>
  );
});

function setRef<T>(
  ref: Ref<T> | AnimatedRef<any> | undefined,
  value: T | null
) {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as { current: T | null }).current = value;
}
