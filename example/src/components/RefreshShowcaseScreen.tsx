import * as React from 'react';
import HeaderMotion, { useMotionProgress } from 'react-native-header-motion';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TitleWithSubtitle } from './TitleWithSubtitle';
import { generateContent } from './generateContent';

interface RefreshShowcaseScreenProps {
  title: string;
  subtitle: string;
  headerColor: string;
  contentBackgroundColor: string;
  contentTextColor: string;
  children: React.ReactNode;
}

export function RefreshShowcaseScreen({
  title,
  subtitle,
  headerColor,
  contentBackgroundColor,
  contentTextColor,
  children,
}: RefreshShowcaseScreenProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2200);
  }, []);

  return (
    <HeaderMotion>
      <HeaderMotion.Bridge>
        {(value) => (
          <Stack.Screen
            options={{
              header: () => (
                <HeaderMotion.NavigationBridge value={value}>
                  <ShowcaseHeader
                    title={title}
                    subtitle={subtitle}
                    headerColor={headerColor}
                  >
                    {children}
                  </ShowcaseHeader>
                </HeaderMotion.NavigationBridge>
              ),
            }}
          />
        )}
      </HeaderMotion.Bridge>
      <HeaderMotion.ScrollView
        refreshControl={
          <HeaderMotion.RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {generateContent({
          count: 500,
          backgroundColor: contentBackgroundColor,
          textColor: contentTextColor,
          label: title,
        })}
      </HeaderMotion.ScrollView>
    </HeaderMotion>
  );
}

interface ShowcaseHeaderProps {
  title: string;
  subtitle: string;
  headerColor: string;
  children: React.ReactNode;
}

function ShowcaseHeader({
  title,
  subtitle,
  headerColor,
  children,
}: ShowcaseHeaderProps) {
  const { progress, progressThreshold } = useMotionProgress();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, threshold],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const dynamicStyle = useAnimatedStyle(() => {
    const threshold = progressThreshold.get();
    const parallaxTranslateY = interpolate(
      progress.value,
      [0, 1],
      [0, threshold * 0.45],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.8],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY: parallaxTranslateY }],
    };
  });

  return (
    <HeaderMotion.Header
      style={[
        styles.headerWrapper,
        { paddingTop: insets.top, backgroundColor: headerColor },
        containerStyle,
      ]}
    >
      <Animated.View style={titleStyle}>
        <TitleWithSubtitle title={title} subtitle={subtitle} />
      </Animated.View>
      <HeaderMotion.Header.Dynamic style={[styles.dynamic, dynamicStyle]}>
        {children}
      </HeaderMotion.Header.Dynamic>
    </HeaderMotion.Header>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  dynamic: {
    minHeight: 104,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    overflow: 'hidden',
  },
});
