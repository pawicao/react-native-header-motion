import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: 'React Native Header Motion - Showcase' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
