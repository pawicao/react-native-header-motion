import { ContentCard, ShowcaseCollapsibleHeader } from '@/components';
import { FlashList } from '@shopify/flash-list';
import HeaderMotion, {
  createHeaderMotionScrollable,
  ScrollablePresets,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';

type ListRow = {
  index: number;
  label: string;
};

const HeaderMotionFlashList = createHeaderMotionScrollable(
  FlashList,
  ScrollablePresets.FlashList
);

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <ShowcaseCollapsibleHeader
                    title="FlashList"
                    subtitle="Shared factory wrapper"
                    backgroundColor="#14532d"
                  />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <HeaderMotionFlashList
        data={content}
        keyExtractor={(item) => `${item.index}`}
        renderItem={({ item }) => (
          <ContentCard
            index={item.index}
            label={item.label}
            backgroundColor="#dcfce7"
            textColor="#14532d"
          />
        )}
      />
    </HeaderMotion>
  );
}

const content: ListRow[] = Array.from({ length: 500 }, (_, k) => ({
  index: k + 1,
  label: 'FlashList Item',
}));
