import { ContentCard, ShowcaseCollapsibleHeader } from '@/components';
import HeaderMotion, {
  createHeaderMotionScrollable,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';

import { AnimatedLegendList } from '@legendapp/list/reanimated';

type ListRow = {
  index: number;
  label: string;
};

const HeaderMotionLegendList = createHeaderMotionScrollable(
  AnimatedLegendList,
  {
    displayName: 'HeaderMotionLegendList',
    isComponentAnimated: true,
  }
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
                    title="LegendList"
                    subtitle="Shared factory wrapper"
                    backgroundColor="#1e3a8a"
                  />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <HeaderMotionLegendList
        data={content}
        estimatedItemSize={120}
        keyExtractor={(item) => `${item.index}`}
        renderItem={({ item }) => (
          <ContentCard
            index={item.index}
            label={item.label}
            backgroundColor="#dbeafe"
            textColor="#1e3a8a"
          />
        )}
      />
    </HeaderMotion>
  );
}

const content: ListRow[] = Array.from({ length: 500 }, (_, k) => ({
  index: k + 1,
  label: 'LegendList Item',
}));
