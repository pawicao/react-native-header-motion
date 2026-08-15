import {
  Collapsible,
  type CollapsiblePresetInput,
} from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DynamicBox } from './DynamicBox';
import { TitleWithSubtitle } from './TitleWithSubtitle';
import { generateContent } from './generateContent';

interface PresetShowcaseScreenProps {
  title: string;
  subtitle: string;
  preset: CollapsiblePresetInput;
  /**
   * Renders the title as a `Collapsible.Pinned` section. Disable to move the
   * title into the collapsing section instead (used by the `none` preset,
   * where the whole header slides away).
   */
  withPinnedTitle?: boolean;
  contentBackgroundColor?: string;
}

export function PresetShowcaseScreen({
  title,
  subtitle,
  preset,
  withPinnedTitle = true,
  contentBackgroundColor = '#E3CBFC',
}: PresetShowcaseScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <Collapsible preset={preset}>
      <Collapsible.NavigationHeader
        style={[styles.header, { paddingTop: insets.top }]}
        render={(header) => <Stack.Screen options={{ header: () => header }} />}
      >
        {withPinnedTitle ? (
          <Collapsible.Pinned>
            <TitleWithSubtitle title={title} subtitle={subtitle} />
          </Collapsible.Pinned>
        ) : null}
        <Collapsible.Dynamic
          style={styles.dynamic}
          contentStyle={styles.dynamicContent}
        >
          {withPinnedTitle ? null : (
            <TitleWithSubtitle title={title} subtitle={subtitle} />
          )}
          <View style={styles.boxRow}>
            <DynamicBox />
            <DynamicBox />
          </View>
        </Collapsible.Dynamic>
      </Collapsible.NavigationHeader>
      <Collapsible.ScrollView>
        {generateContent({
          count: 500,
          backgroundColor: contentBackgroundColor,
          textColor: '#304077',
        })}
      </Collapsible.ScrollView>
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
  dynamicContent: {
    gap: 12,
  },
  boxRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'stretch',
  },
});
