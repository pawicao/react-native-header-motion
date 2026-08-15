import { PresetShowcaseScreen } from '@/components';

export default function Screen() {
  return (
    <PresetShowcaseScreen
      title="Preset: none"
      subtitle="No content effect — the header slides away"
      preset="none"
      withPinnedTitle={false}
      contentBackgroundColor="#FCCBE3"
    />
  );
}
