import { ContentCard } from './ContentCard';

interface GenerateContentOptions {
  count?: number;
  backgroundColor?: string;
  textColor?: string;
  label?: string;
}

export function generateContent({
  count = 500,
  backgroundColor = '#E3CBFC',
  textColor = '#304077',
  label,
}: GenerateContentOptions = {}) {
  return Array.from({ length: count }, (_, k) => (
    <ContentCard
      key={k}
      index={k + 1}
      backgroundColor={backgroundColor}
      textColor={textColor}
      label={label}
    />
  ));
}
