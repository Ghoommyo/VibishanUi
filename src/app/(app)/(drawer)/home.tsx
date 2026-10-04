import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useCurrentUser, useSession } from '@/providers/session';

export default function HomeScreen() {
  const user = useCurrentUser();
  const { signOut } = useSession();
  return (
    <Screen>
      <ThemedText type="subtitle">Hi, {user.profile.name}</ThemedText>
      <Button title="Log out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
