import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="chat/[id]/index" options={{ title: 'Chat' }} />
      <Stack.Screen name="chat/[id]/summary" options={{ title: 'Summary' }} />
    </Stack>
  );
}
