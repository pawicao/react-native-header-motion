import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  activeTextColor?: string;
  inactiveTextColor?: string;
  indicatorColor?: string;
}

export function TabButton({
  label,
  isActive,
  onPress,
  activeTextColor = '#9ca5d7',
  inactiveTextColor = '#FFF',
  indicatorColor = '#232323',
}: TabButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Text
        weight="700"
        style={[
          styles.tabText,
          { color: isActive ? activeTextColor : inactiveTextColor },
        ]}
      >
        {label}
      </Text>
      {/* {isActive && (
        <View
          style={[styles.activeIndicator, { backgroundColor: indicatorColor }]}
        />
      )} */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    borderRadius: 2,
  },
});
