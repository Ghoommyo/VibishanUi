import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    </Stack>
  );
}
