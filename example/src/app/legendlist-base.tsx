import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { FlashList } from '@shopify/flash-list';
import {
  FlatList,
  ScrollView,
  Text,
  View,
  type ScrollViewProps,
} from 'react-native';

const items = ['a', 'b', 'c'];

export default function Screen() {
  return (
    <AnimatedLegendList
      data={items}
      renderItem={(item) => <Text>{item.item}</Text>}
      keyExtractor={(item) => item}
      contentContainerStyle={{ backgroundColor: 'red', paddingTop: 12 }}
      renderScrollComponent={(props) => <ScrollComponent {...props} />}
    />
  );
}

function ScrollComponent({
  children,
  contentContainerStyle,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView {...props}>
      <View style={contentContainerStyle}>{children}</View>
    </ScrollView>
  );
}
