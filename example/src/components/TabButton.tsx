import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  activeTextColor = '#232323',
  inactiveTextColor = '#9CA5D7',
  indicatorColor = '#232323',
}: TabButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Text
        style={[
          styles.tabText,
          { color: isActive ? activeTextColor : inactiveTextColor },
        ]}
      >
        {label}
      </Text>
      {isActive && (
        <View
          style={[styles.activeIndicator, { backgroundColor: indicatorColor }]}
        />
      )}
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
    fontWeight: '600',
    fontSize: 14,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    borderRadius: 2,
  },
});
