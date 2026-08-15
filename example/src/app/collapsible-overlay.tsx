import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import { Collapsible } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// No NavigationHeader here: the navigation header is hidden and
// Collapsible.Header renders in place, overlaying the content (the default
// `overlay` behavior of the low-level Header).
export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <Collapsible preset="collapse">
      <Stack.Screen options={{ headerShown: false }} />
      <Collapsible.Header style={[styles.header, { paddingTop: insets.top }]}>
        <Collapsible.Pinned>
          <TitleWithSubtitle
            title="Overlay header"
            subtitle="Collapsible.Header without NavigationHeader"
          />
        </Collapsible.Pinned>
        <Collapsible.Dynamic
          style={styles.dynamic}
          contentStyle={styles.boxRow}
        >
          <DynamicBox />
          <DynamicBox />
        </Collapsible.Dynamic>
      </Collapsible.Header>
      <Collapsible.ScrollView>{content}</Collapsible.ScrollView>
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#304077',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dynamic: {
    padding: 12,
  },
  boxRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'stretch',
  },
});

const content = generateContent({
  count: 500,
  backgroundColor: '#CBFCF5',
  textColor: '#304077',
});
