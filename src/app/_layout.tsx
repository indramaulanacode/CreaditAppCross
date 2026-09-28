import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Creadit App' }} />
      <Stack.Screen name="countscreen" options={{ title: 'Kalkulator Kredit' }} />
    </Stack>
  );
}