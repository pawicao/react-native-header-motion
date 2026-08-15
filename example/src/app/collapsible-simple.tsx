import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import { Collapsible } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <Collapsible preset="parallax">
      <Collapsible.NavigationHeader
        style={[styles.header, { paddingTop: insets.top }]}
        render={(header) => <Stack.Screen options={{ header: () => header }} />}
      >
        <Collapsible.Pinned>
          <TitleWithSubtitle
            title="Collapsible"
            subtitle="High-level API · parallax preset"
          />
        </Collapsible.Pinned>
        <Collapsible.Dynamic
          style={styles.dynamic}
          contentStyle={styles.boxRow}
        >
          <DynamicBox />
          <DynamicBox />
        </Collapsible.Dynamic>
      </Collapsible.NavigationHeader>
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
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
});
