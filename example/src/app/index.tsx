import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function Screen() {
  return (
    <View>
      <Link style={styles.link} href="/simple">
        Collapsible
      </Link>
      <Link style={styles.link} href="/collapsible-pager">
        Collapsible + Pager View
      </Link>
      <Link style={styles.link} href="/colors">
        Color interpolation
      </Link>
      <Link style={styles.link} href="/overscroll">
        Overscroll
      </Link>
      <Link style={styles.link} href="/flatlist">
        FlatList
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    padding: 8,
  },
});
