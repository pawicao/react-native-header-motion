import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import {
  Collapsible,
  CollapsibleTabs,
  createPagerViewAdapter,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const pagerAdapter = createPagerViewAdapter(PagerView);

const TABS = [
  { name: 'a', label: 'Page A' },
  { name: 'b', label: 'Page B' },
];

export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <CollapsibleTabs tabs={TABS} preset="collapse">
      <Collapsible.NavigationHeader
        style={[styles.header, { paddingTop: insets.top }]}
        render={(header) => <Stack.Screen options={{ header: () => header }} />}
      >
        <Collapsible.Pinned>
          <TitleWithSubtitle
            title="Collapsible Tabs"
            subtitle="High-level API · pager-view adapter"
          />
        </Collapsible.Pinned>
        <Collapsible.Dynamic
          style={styles.dynamic}
          contentStyle={styles.boxRow}
        >
          <DynamicBox />
          <DynamicBox />
        </Collapsible.Dynamic>
        <CollapsibleTabs.Bar
          style={styles.tabBar}
          labelStyle={styles.tabLabel}
        />
      </Collapsible.NavigationHeader>
      <CollapsibleTabs.Pager adapter={pagerAdapter}>
        <CollapsibleTabs.Tab name="a">
          <Collapsible.ScrollView>{contentA}</Collapsible.ScrollView>
        </CollapsibleTabs.Tab>
        <CollapsibleTabs.Tab name="b">
          <Collapsible.ScrollView>{contentB}</Collapsible.ScrollView>
        </CollapsibleTabs.Tab>
      </CollapsibleTabs.Pager>
    </CollapsibleTabs>
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
  tabBar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  tabLabel: {
    color: '#304077',
  },
});

const contentA = generateContent({
  count: 500,
  backgroundColor: '#E3CBFC',
  textColor: '#304077',
  label: 'Page A',
});
const contentB = generateContent({
  count: 500,
  backgroundColor: '#CBE3FC',
  textColor: '#304077',
  label: 'Page B',
});
