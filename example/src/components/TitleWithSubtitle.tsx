import { StyleSheet, Text, View } from 'react-native';

interface TitleWithSubtitleProps {
  title: string;
  subtitle: string;
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: number;
  subtitleSize?: number;
  centered?: boolean;
}

const HEADER_TITLE_PLATFORM_HEIGHT = 44;

export function TitleWithSubtitle({
  title,
  subtitle,
  titleColor = '#FFF',
  subtitleColor = '#FFF',
  titleSize = 17,
  subtitleSize = 11,
  centered = true,
}: TitleWithSubtitleProps) {
  return (
    <View style={[styles.titleContainer, centered && styles.centered]}>
      <Text style={[styles.title, { color: titleColor, fontSize: titleSize }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: subtitleColor, fontSize: subtitleSize },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
    height: HEADER_TITLE_PLATFORM_HEIGHT,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    fontWeight: '400',
    opacity: 0.6,
  },
});
