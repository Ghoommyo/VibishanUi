import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { roomsApi, type PublicUser } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { clockTime, fullDateTime } from '@/utils/time';

const nameOf = (u: PublicUser) => u.profile.name || u.username;

export default function SummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error } = useApi(() => roomsApi.getSummary(id), `summary:${id}`);

  if (error && !data) {
    return (
      <Screen>
        <ThemedText themeColor="textSecondary">{error.message}</ThemedText>
      </Screen>
    );
  }
  if (!data) return <ActivityIndicator style={styles.loading} />;

  const { room } = data;

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText themeColor="textSecondary">
          {room.kind === 'listen' ? 'Listening session' : 'Moderated session'} with {nameOf(data.provider)}
          {room.closedAt ? ` · closed ${fullDateTime(room.closedAt)}` : ' · still open'}
        </ThemedText>
      </View>

      <Block title={`Starred messages (${data.starred.length})`} empty="No messages were starred.">
        {data.starred.map((m, i) => (
          <View key={m.id} style={styles.item}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.index}>
              {i + 1}.
            </ThemedText>
            <View style={styles.flex}>
              <ThemedText type="small">{m.text}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {nameOf(m.sender)} · {clockTime(m.createdAt)}
              </ThemedText>
            </View>
          </View>
        ))}
      </Block>

      <Block title="Comments by participants" empty="No participant comments.">
        {data.comments.map((c) => (
          <Note key={c.user.id} user={c.user} text={c.text} />
        ))}
      </Block>

      {room.kind === 'listen' ? (
        <Block title="Observation by listener" empty="The listener has not added an observation.">
          {data.observation && <Note user={data.observation.user} text={data.observation.text} />}
        </Block>
      ) : (
        <Block title="Verdict by moderator" empty="The moderator has not given a verdict.">
          {data.verdict && <Note user={data.verdict.user} text={data.verdict.text} />}
        </Block>
      )}
    </Screen>
  );
}

function Block({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasContent = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <View style={styles.block}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.blockTitle}>
        {title}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        {hasContent ? (
          children
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            {empty}
          </ThemedText>
        )}
      </ThemedView>
    </View>
  );
}

function Note({ user, text }: { user: PublicUser; text: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.note, { borderColor: theme.border }]}>
      <Avatar user={user} size={32} />
      <View style={styles.flex}>
        <ThemedText type="smallBold">{nameOf(user)}</ThemedText>
        <ThemedText type="small">{text}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: Spacing.six,
  },
  header: {
    gap: Spacing.one,
  },
  block: {
    gap: Spacing.two,
  },
  blockTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.one,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  index: {
    minWidth: 20,
  },
  flex: {
    flex: 1,
    gap: Spacing.half,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
