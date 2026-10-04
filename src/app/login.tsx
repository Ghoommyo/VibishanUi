import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DEMO_ACCOUNTS, DEMO_PASSWORD, type Role } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { errorMessage, ROLE_LABEL, ROLE_OPTIONS } from '@/constants/roles';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session';

export default function LoginScreen() {
  const { signIn } = useSession();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length > 0;

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // On success the protected routes swap over and the router redirects to /home.
      await signIn(username, password, role);
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Welcome back</ThemedText>
        <ThemedText themeColor="textSecondary">Log in to continue.</ThemedText>
      </View>

      <TextField
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={canSubmit ? submit : undefined}
      />
      <SegmentedControl label="Type" options={ROLE_OPTIONS} value={role} onChange={setRole} />

      {error && <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>}

      <Button title="Log in" onPress={submit} loading={submitting} disabled={!canSubmit} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Not a member?
        </ThemedText>
        <Link href="/signup" replace>
          <ThemedText type="linkPrimary">Sign up</ThemedText>
        </Link>
      </View>

      <ThemedView type="backgroundElement" style={styles.demo}>
        <ThemedText type="smallBold">Demo accounts</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Tap one to fill in its details. The password is {DEMO_PASSWORD}.
        </ThemedText>
        <View style={styles.chips}>
          {DEMO_ACCOUNTS.map((account) => (
            <Pressable
              key={account.username}
              onPress={() => {
                setUsername(account.username);
                setPassword(DEMO_PASSWORD);
                setRole(account.role);
                setError(null);
              }}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: theme.border, backgroundColor: theme.background, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="small">
                {account.username} · {ROLE_LABEL[account.role]}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    maxWidth: 480,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  demo: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
  },
});
