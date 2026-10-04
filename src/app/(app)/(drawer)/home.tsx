import { StyleSheet, View } from 'react-native';

import { ProviderAnalytics } from '@/components/provider-analytics';
import { RequestServiceForm } from '@/components/request-service-form';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCurrentUser } from '@/providers/session';

export default function HomeScreen() {
  const user = useCurrentUser();
  const firstName = (user.profile.name || user.username).split(' ')[0];

  return (
    <Screen>
      <View style={styles.greeting}>
        <ThemedText type="subtitle">Hi, {firstName}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {user.role === 'user'
            ? 'Who would you like to talk to today?'
            : 'Here is how your sessions are going.'}
        </ThemedText>
      </View>
      {user.role === 'user' ? <RequestServiceForm /> : <ProviderAnalytics />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
});
