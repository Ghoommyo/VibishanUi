import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { usersApi, type PublicUser } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Row, Section } from '@/components/ui/section';
import { StarRating } from '@/components/ui/star-rating';
import { TextField } from '@/components/ui/text-field';
import { errorMessage, ROLE_LABEL } from '@/constants/roles';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session';

type Draft = { name: string; phone: string; email: string; bio: string; expertise: string };

function toDraft(user: PublicUser): Draft {
  return {
    name: user.profile.name,
    phone: user.profile.phone,
    email: user.email,
    bio: user.profile.bio,
    expertise: user.profile.expertise.join(', '),
  };
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { refreshUser } = useSession();
  const { data: me, setData } = useApi(usersApi.getMe, 'me');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!me) {
    return (
      <Screen>
        <ActivityIndicator style={styles.loading} />
      </Screen>
    );
  }

  const isProvider = me.role !== 'user';
  const editing = draft !== null;
  const set = (field: keyof Draft) => (text: string) => setDraft((d) => (d ? { ...d, [field]: text } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await usersApi.updateProfile({
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email,
        bio: draft.bio.trim(),
        expertise: draft.expertise
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setData({ ...me, ...updated });
      await refreshUser();
      setDraft(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Avatar user={me} size={88} />
        <ThemedText type="subtitle" style={styles.center}>
          {me.profile.name || me.username}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          @{me.username} · {ROLE_LABEL[me.role]}
        </ThemedText>
        {isProvider && (
          <View style={styles.rating}>
            <StarRating value={me.rating.average ?? 0} size={18} />
            <ThemedText type="small" themeColor="textSecondary">
              {me.rating.average ? `${me.rating.average.toFixed(1)} (${me.rating.count} ratings)` : 'No ratings yet'}
            </ThemedText>
          </View>
        )}
      </View>

      {editing ? (
        <View style={styles.form}>
          <TextField label="Name" value={draft.name} onChangeText={set('name')} autoComplete="name" />
          <TextField
            label="Contact number"
            value={draft.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <TextField
            label="Email"
            value={draft.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextField label="Bio" value={draft.bio} onChangeText={set('bio')} multiline maxLength={280} />
          {isProvider && (
            <TextField
              label="Areas of expertise"
              value={draft.expertise}
              onChangeText={set('expertise')}
              hint="Separate with commas, e.g. Stress, Career"
            />
          )}
          {error && <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>}
          <View style={styles.buttons}>
            <Button title="Cancel" variant="secondary" onPress={() => setDraft(null)} style={styles.flex} />
            <Button title="Save" onPress={save} loading={saving} style={styles.flex} />
          </View>
        </View>
      ) : (
        <>
          <Section title="Details">
            <Row label="Name" right={<Value text={me.profile.name} />} />
            <Row label="Contact number" right={<Value text={me.profile.phone} />} />
            <Row label="Email" right={<Value text={me.email} />} />
            <Row label="Member since" right={<Value text={new Date(me.createdAt).toLocaleDateString()} />} last />
          </Section>
          <Section title="Bio">
            <View style={styles.block}>
              <ThemedText type="small" themeColor={me.profile.bio ? 'text' : 'textSecondary'}>
                {me.profile.bio || 'Tell people a little about yourself.'}
              </ThemedText>
            </View>
          </Section>
          {isProvider && (
            <Section title="Areas of expertise">
              <View style={[styles.block, styles.tags]}>
                {me.profile.expertise.length ? (
                  me.profile.expertise.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: theme.background }]}>
                      <ThemedText type="small">{tag}</ThemedText>
                    </View>
                  ))
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    None added yet.
                  </ThemedText>
                )}
              </View>
            </Section>
          )}
          <Button
            title="Edit profile"
            variant="secondary"
            onPress={() => {
              setError(null);
              setDraft(toDraft(me));
            }}
          />
        </>
      )}
    </Screen>
  );
}

function Value({ text }: { text: string }) {
  return (
    <ThemedText type="small" themeColor={text ? 'text' : 'textSecondary'} style={styles.value} numberOfLines={1}>
      {text || 'Not set'}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: Spacing.six,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
  block: {
    paddingVertical: Spacing.three,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
  },
});
