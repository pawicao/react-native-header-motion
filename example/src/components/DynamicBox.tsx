import { StyleSheet, Text, View } from 'react-native';

interface DynamicBoxProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  variant?: 'small' | 'medium' | 'large' | 'humongous';
}

export function DynamicBox({
  text = 'Dynamic Content',
  backgroundColor = '#9CA5D7',
  textColor = '#304077',
  variant = 'small',
}: DynamicBoxProps) {
  return (
    <View
      style={[
        styles.box,
        variant === 'medium' && styles.mediumBox,
        variant === 'large' && styles.largeBox,
        variant === 'humongous' && styles.humongousBox,
        { backgroundColor },
      ]}
    >
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
  mediumBox: {
    minHeight: 120,
  },
  largeBox: {
    minHeight: 250,
  },
  humongousBox: {
    minHeight: 450,
  },
  text: {
    fontWeight: 'bold',
  },
});
