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
      <Link style={styles.link} href="/scroll-manager">
        ScrollManager
      </Link>
      <Link style={styles.link} href="/scroll-handlers">
        ScrollView consumer handlers (console)
      </Link>
      <Link style={styles.link} href="/flatlist-handlers">
        FlatList consumer handlers (console)
      </Link>
      <Link style={styles.link} href="/refresh-scrollview-control">
        Refresh ScrollView
      </Link>
      <Link style={styles.link} href="/refresh-flatlist-control">
        Refresh FlatList (refreshControl)
      </Link>
      <Link style={styles.link} href="/refresh-flatlist-props">
        Refresh FlatList (refreshing/onRefresh)
      </Link>
      <Link style={styles.link} href="/refresh-flatlist-props-offset">
        Refresh FlatList (custom progressViewOffset)
      </Link>
      <Link style={styles.link} href="/short-content">
        Short Content (min height)
      </Link>
      <Link style={styles.link} href="/external-ref">
        External Ref (short content)
      </Link>
      <Link style={styles.link} href="/scroll-to-button">
        Scroll To Button (external ref)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    padding: 8,
  },
});
