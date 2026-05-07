import { ContentCard, DynamicBox, TitleWithSubtitle } from '@/components';
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListRow = {
  index: number;
  label: string;
};

export default function Screen() {
  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <CollapsibleHeader />
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>

      <HeaderMotion.SubHeader>
        <View style={styles.searchBarContainer}>
          <TextInput
            placeholder="Search in this list"
            placeholderTextColor="#6c7aaa"
            style={styles.searchInput}
          />
        </View>
      </HeaderMotion.SubHeader>

      <HeaderMotion.FlatList
        data={content}
        keyExtractor={(item) => `${item.index}`}
        renderItem={({ item }) => (
          <ContentCard index={item.index} label={item.label} />
        )}
      />
    </HeaderMotion>
  );
}

function CollapsibleHeader() {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.get(),
      [0, 1],
      [0, threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const boxSectionStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const parallaxTranslateY = interpolate(
      progress.get(),
      [0, 1],
      [0, threshold * 0.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      progress.get(),
      [0, 1 * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      progress.get(),
      [0, 1],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: parallaxTranslateY }, { scale }],
    };
  });

  return (
    <HeaderMotion.Header
      style={[styles.headerWrapper, { paddingTop: insets.top }, containerStyle]}
    >
      <Animated.View style={[titleStyle]}>
        <TitleWithSubtitle
          title="SubHeader + FlatList"
          subtitle="Single list"
        />
      </Animated.View>

      <View style={styles.dynamicContent}>
        <HeaderMotion.Header.Dynamic
          style={[styles.boxContainer, boxSectionStyle]}
        >
          <DynamicBox />
          <DynamicBox />
        </HeaderMotion.Header.Dynamic>
      </View>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#304077',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dynamicContent: {
    overflow: 'hidden',
  },
  boxContainer: {
    flexDirection: 'row',
    gap: 6,
    padding: 12,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  searchBarContainer: {
    backgroundColor: '#E3CBFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d6b4f6',
  },
  searchInput: {
    height: 40,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d9d9e3',
    color: '#304077',
    paddingHorizontal: 12,
  },
});

const content: ListRow[] = Array.from({ length: 200 }, (_, k) => ({
  index: k + 1,
  label: 'FlatList Item',
}));
