import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ApiError, resetDb, USE_MOCK, usersApi, type UserSettings } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Screen } from '@/components/ui/screen';
import { Row, Section } from '@/components/ui/section';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePrefs, type ThemePref } from '@/providers/prefs';
import { useCurrentUser, useSession } from '@/providers/session';

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const user = useCurrentUser();
  const { refreshUser, signOut } = useSession();
  const { themePref, setThemePref } = usePrefs();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const isProvider = user.role !== 'user';

  const toggle = (key: keyof UserSettings) => async (value: boolean) => {
    await usersApi.updateSettings({ [key]: value });
    await refreshUser();
  };

  const switchFor = (key: keyof UserSettings) => (
    <Switch
      value={user.settings[key]}
      onValueChange={toggle(key)}
      trackColor={{ true: theme.primary, false: theme.border }}
    />
  );

  return (
    <Screen>
      <Section title="Appearance">
        <View style={styles.block}>
          <ThemedText type="small">Theme</ThemedText>
          <SegmentedControl options={THEME_OPTIONS} value={themePref} onChange={setThemePref} />
        </View>
      </Section>

      <Section title="Notifications">
        <Row
          label="Request updates"
          description="Badge the bell when your requests are accepted or declined."
          right={switchFor('notifyRequests')}
        />
        <Row
          label="Message previews"
          description="Show the latest message in the chatroom list."
          right={switchFor('showMessagePreviews')}
          last
        />
      </Section>

      {isProvider && (
        <Section title="Availability">
          <Row
            label="Available for new requests"
            description={`When off, you won't appear in the ${user.role} list for new sessions.`}
            right={switchFor('available')}
            last
          />
        </Section>
      )}

      <Section title="About">
        <Row label="Version" right={<ThemedText type="small">{Constants.expoConfig?.version ?? '–'}</ThemedText>} />
        <Row
          label="Demo data"
          description="Restore the sample accounts, chats and ratings."
          last
          right={<Button title="Reset" size="small" variant="secondary" onPress={() => setConfirmReset(true)} />}
        />
      </Section>

      <Button title="Log out" variant="ghost" icon="logout" onPress={signOut} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        Signed in as @{user.username}
      </ThemedText>

      <Dialog
        visible={confirmReset}
        title="Reset demo data?"
        message={`This deletes every account, request and chat created ${
          USE_MOCK ? 'on this device' : 'on the server'
        } and restores the sample data. You'll be logged out.`}
        onClose={() => {
          setConfirmReset(false);
          setResetError(null);
        }}
        actions={
          <>
            <Button title="Cancel" variant="secondary" size="small" onPress={() => setConfirmReset(false)} />
            <Button
              title="Reset"
              variant="danger"
              size="small"
              loading={resetting}
              onPress={async () => {
                setResetting(true);
                setResetError(null);
                try {
                  await resetDb();
                } catch (e) {
                  setResetError(e instanceof ApiError ? e.message : 'Could not reset the data.');
                  setResetting(false);
                  return;
                }
                await signOut();
              }}
            />
          </>
        }>
        {resetError && <ThemedText themeColor="danger">{resetError}</ThemedText>}
      </Dialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
});
