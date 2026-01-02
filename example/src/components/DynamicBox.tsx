import { StyleSheet, Text, View } from 'react-native';

interface DynamicBoxProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function DynamicBox({
  text = 'Dynamic Content',
  backgroundColor = '#9CA5D7',
  textColor = '#304077',
}: DynamicBoxProps) {
  return (
    <View style={[styles.box, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});
