import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

export type HeaderBaseProps = ViewProps;
export type AnimatedHeaderBaseProps = AnimatedProps<ViewProps>;

export function HeaderBase({ style, ...rest }: HeaderBaseProps) {
  return <View style={[style, styles.container]} {...rest} />;
}

export function AnimatedHeaderBase({
  style,
  ...rest
}: AnimatedHeaderBaseProps) {
  return <Animated.View style={[style, styles.container]} {...rest} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
