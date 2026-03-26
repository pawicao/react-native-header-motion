import { ContentCard, ShowcaseCollapsibleHeader } from '@/components';
import { FlashList } from '@shopify/flash-list';
import HeaderMotion, {
  createHeaderMotionScrollable,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';

type ListRow = {
  index: number;
  label: string;
};

const HeaderMotionFlashList = createHeaderMotionScrollable(FlashList, {
  displayName: 'HeaderMotionFlashList',
});

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Header>
        {(headerProps) => (
          <Stack.Screen
            options={{
              header: () => (
                <ShowcaseCollapsibleHeader
                  {...headerProps}
                  title="FlashList"
                  subtitle="Shared factory wrapper"
                  backgroundColor="#14532d"
                />
              ),
            }}
          />
        )}
      </HeaderMotion.Header>
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
