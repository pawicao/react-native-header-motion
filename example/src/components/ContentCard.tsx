import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

interface ContentCardProps {
  index: number;
  backgroundColor?: string;
  textColor?: string;
  label?: string;
}

export function ContentCard({
  index,
  backgroundColor = '#E3CBFC',
  textColor = '#304077',
  label,
}: ContentCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text weight="700" style={[styles.cardTitle, { color: textColor }]}>
        {label ? `${label} ${index}` : `Item ${index}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
  },
});
