import type { ComponentProps } from 'react';
import { Text as RNText } from 'react-native';

const FONT_FAMILY_BY_WEIGHT = {
  '100': 'KumbhSans_100Thin',
  '200': 'KumbhSans_200ExtraLight',
  '300': 'KumbhSans_300Light',
  '400': 'KumbhSans_400Regular',
  '500': 'KumbhSans_500Medium',
  '600': 'KumbhSans_600SemiBold',
  '700': 'KumbhSans_700Bold',
  '800': 'KumbhSans_800ExtraBold',
  '900': 'KumbhSans_900Black',
} as const;

export type TextWeight = keyof typeof FONT_FAMILY_BY_WEIGHT;

export interface TextProps extends ComponentProps<typeof RNText> {
  weight?: TextWeight;
}

export function Text({ style, weight = '400', ...props }: TextProps) {
  return (
    <RNText
      {...props}
      style={[
        style,
        {
          fontFamily: FONT_FAMILY_BY_WEIGHT[weight],
        },
      ]}
    />
  );
}
