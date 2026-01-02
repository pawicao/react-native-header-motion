import {
  AnimatedHeaderBase,
  HeaderBase,
  HeaderMotionContextProvider,
  HeaderMotionFlatList,
  HeaderMotionHeader,
  HeaderMotionScrollManager,
  HeaderMotionScrollView,
  type HeaderMotionFlatListProps,
  type HeaderMotionHeaderProps,
  type HeaderMotionProps,
  type HeaderMotionScrollManagerProps,
  type HeaderMotionScrollViewProps,
} from './components';

type HeaderMotionComponent = {
  <T extends string>(props: HeaderMotionProps<T>): React.ReactElement;
  Header: typeof HeaderMotionHeader;
  ScrollManager: typeof HeaderMotionScrollManager;
  ScrollView: typeof HeaderMotionScrollView;
  FlatList: typeof HeaderMotionFlatList;
};

const HeaderMotion = HeaderMotionContextProvider as HeaderMotionComponent;
HeaderMotion.Header = HeaderMotionHeader;
HeaderMotion.ScrollManager = HeaderMotionScrollManager;
HeaderMotion.ScrollView = HeaderMotionScrollView;
HeaderMotion.FlatList = HeaderMotionFlatList;

export default HeaderMotion;
export * from './hooks';
export type * from './types';
export { AnimatedHeaderBase, HeaderBase };
export type {
  HeaderMotionFlatListProps,
  HeaderMotionHeaderProps,
  HeaderMotionProps,
  HeaderMotionScrollManagerProps,
  HeaderMotionScrollViewProps,
};
