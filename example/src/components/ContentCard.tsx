import { StyleSheet, Text, View } from 'react-native';

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
      <Text style={[styles.cardTitle, { color: textColor }]}>
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
    fontWeight: '700',
  },
});
