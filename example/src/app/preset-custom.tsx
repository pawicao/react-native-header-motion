import { DynamicBox, TitleWithSubtitle, generateContent } from '@/components';
import {
  Collapsible,
  createCollapsiblePreset,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { interpolateColor } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// A custom preset is a worklet from motion state to per-part styles. This one
// folds the collapsing content backwards in 3D, fades it, and darkens the
// header background while it collapses.
const fold = createCollapsiblePreset(({ progress, progressThreshold }) => {
  'worklet';
  return {
    header: {
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        ['#304077', '#0E1A40']
      ),
    },
    dynamicContent: {
      opacity: 1 - progress,
      transform: [
        { perspective: 600 },
        { rotateX: `${progress * 60}deg` },
        { translateY: progress * progressThreshold * 0.25 },
      ],
    },
  };
});

export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <Collapsible preset={fold}>
      <Collapsible.NavigationHeader
        style={[styles.header, { paddingTop: insets.top }]}
        render={(header) => <Stack.Screen options={{ header: () => header }} />}
      >
        <Collapsible.Pinned>
          <TitleWithSubtitle
            title="Custom preset"
            subtitle="createCollapsiblePreset · 3D fold + header tint"
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
  backgroundColor: '#CBCFFC',
  textColor: '#304077',
});
