import { ContentCard, DynamicBox, TitleWithSubtitle } from '@/components';
import { Collapsible, CollapsibleTabs } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListRow = {
  index: number;
  label: string;
};

const TABS = [
  { name: 'cards', label: 'Cards' },
  { name: 'list', label: 'FlatList' },
];

export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <CollapsibleTabs tabs={TABS} preset="scale">
      <Collapsible.NavigationHeader
        style={[styles.header, { paddingTop: insets.top }]}
        render={(header) => <Stack.Screen options={{ header: () => header }} />}
      >
        <Collapsible.Pinned>
          <TitleWithSubtitle
            title="Collapsible Tabs"
            subtitle="High-level API · built-in pager"
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
      <CollapsibleTabs.Pager>
        <CollapsibleTabs.Tab name="cards">
          <Collapsible.ScrollView>
            {cards.map((row) => (
              <ContentCard
                key={row.index}
                index={row.index}
                label={row.label}
                backgroundColor="#E3CBFC"
                textColor="#304077"
              />
            ))}
          </Collapsible.ScrollView>
        </CollapsibleTabs.Tab>
        <CollapsibleTabs.Tab name="list">
          <Collapsible.FlatList
            data={rows}
            keyExtractor={(item) => `${item.index}`}
            renderItem={({ item }) => (
              <ContentCard
                index={item.index}
                label={item.label}
                backgroundColor="#CBE3FC"
                textColor="#304077"
              />
            )}
          />
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

const cards: ListRow[] = Array.from({ length: 500 }, (_, k) => ({
  index: k + 1,
  label: 'Cards',
}));
const rows: ListRow[] = Array.from({ length: 500 }, (_, k) => ({
  index: k + 1,
  label: 'FlatList',
}));
