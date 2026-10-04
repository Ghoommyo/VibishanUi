import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { notificationsApi, requestsApi } from '@/api';
import type { NotificationItem } from '@/api/notifications';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { errorMessage } from '@/constants/roles';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentUser } from '@/providers/session';
import { fullDateTime, timeAgo } from '@/utils/time';

export default function NotificationsScreen() {
  const { data, loading, refetch } = useApi(notificationsApi.list, 'notifications', { pollMs: 3000 });

  // Mark everything read when leaving, so unread items stay highlighted while they're on screen.
  useFocusEffect(
    useCallback(() => {
      return () => {
        notificationsApi.markAllRead().catch(() => {});
      };
    }, []),
  );

  if (loading && !data) return <ActivityIndicator style={styles.loading} />;

  return (
    <ThemedView style={styles.fill}>
      <FlatList
        data={data}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No notifications yet.
          </ThemedText>
        }
        renderItem={({ item }) => <NotificationCard item={item} onChanged={refetch} />}
      />
    </ThemedView>
  );
}

function NotificationCard({ item, onChanged }: { item: NotificationItem; onChanged: () => void }) {
  const theme = useTheme();
  const me = useCurrentUser();
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const { request } = item;
  const who = item.kind === 'request_received' ? item.requester : item.provider;
  const isOutgoing = request.requesterId === me.id;

  const respond = async (accept: boolean) => {
    setBusy(accept ? 'accept' : 'reject');
    setError(null);
    try {
      await requestsApi.respond(request.id, accept);
      setAccepted(accept);
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  // For group requests, show where each approval stands.
  const approvers =
    request.kind === 'moderate' && (isOutgoing || item.kind === 'request_received')
      ? [...item.participants, item.provider]
      : [];

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, !item.read && { borderColor: theme.primary }]}
      accessibilityLabel={item.read ? undefined : 'Unread'}>
      <View style={styles.header}>
        <Avatar user={who} size={40} />
        <View style={styles.headerText}>
          <ThemedText type="small">{item.text}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {request.kind === 'listen' ? 'Listening' : 'Moderation'} · {fullDateTime(item.createdAt)} (
            {timeAgo(item.createdAt)})
          </ThemedText>
        </View>
        <StatusPill status={request.status} />
      </View>

      {approvers.length > 0 && (
        <View style={styles.approvals}>
          {approvers.map((user) => (
            <View key={user.id} style={styles.approval}>
              <ThemedText type="small" themeColor="textSecondary">
                {user.id === request.providerId ? 'Moderator' : 'Participant'} · {user.profile.name || user.username}
              </ThemedText>
              <StatusPill status={request.approvals[user.id] ?? 'pending'} />
            </View>
          ))}
        </View>
      )}

      {item.actionable && (
        <View style={styles.actions}>
          <Button
            title="Reject"
            variant="secondary"
            size="small"
            onPress={() => respond(false)}
            loading={busy === 'reject'}
            disabled={busy !== null}
            style={styles.flex}
          />
          <Button
            title="Accept"
            size="small"
            onPress={() => respond(true)}
            loading={busy === 'accept'}
            disabled={busy !== null}
            style={styles.flex}
          />
        </View>
      )}

      {accepted && (
        <Link href="/chats">
          <ThemedText type="small" style={{ color: theme.primary }}>
            {request.kind === 'moderate' && me.id !== request.providerId
              ? 'Accepted. The chatroom opens once the moderator accepts →'
              : 'Accepted. Open Chatrooms →'}
          </ThemedText>
        </Link>
      )}
      {error && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  loading: {
    marginTop: Spacing.six,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two + Spacing.half,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  approvals: {
    gap: Spacing.one,
    paddingLeft: 40 + Spacing.three,
  },
  approval: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingLeft: 40 + Spacing.three,
  },
  flex: {
    flex: 1,
  },
});
