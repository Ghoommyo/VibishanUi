import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { roomsApi } from '@/api';
import type { RoomListItem } from '@/api/rooms';
import { ChatRow } from '@/components/chat/chat-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useCurrentUser } from '@/providers/session';

export default function ChatsScreen() {
  const user = useCurrentUser();
  const { data, loading } = useApi(roomsApi.listMyRooms, 'rooms', { pollMs: 5000 });
  const [selected, setSelected] = useState<RoomListItem | null>(null);

  const open = (item: RoomListItem) => {
    if (item.room.status === 'active') router.push({ pathname: '/chat/[id]', params: { id: item.room.id } });
    else setSelected(item);
  };

  const close = () => setSelected(null);
  const status = selected?.room.status;
  // Read during render with optional chaining: the React Compiler hoists property reads out of handlers.
  const selectedId = selected?.room.id;
  const goTo = (pathname: '/chat/[id]' | '/chat/[id]/summary') => {
    close();
    if (selectedId) router.push({ pathname, params: { id: selectedId } });
  };

  return (
    <ThemedView style={styles.fill}>
      {loading && !data ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.room.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ChatRow item={item} showPreview={user.settings.showMessagePreviews} onPress={() => open(item)} />
          )}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              {user.role === 'user'
                ? 'No chatrooms yet. Send a request from Home to start one.'
                : 'No chatrooms yet. Accepted requests show up here.'}
            </ThemedText>
          }
        />
      )}

      <Dialog
        visible={status === 'closed'}
        title="This chat is closed"
        message="Go through the full conversation, or see the summary of starred messages and closing notes."
        onClose={close}
        actions={
          <>
            <Button
              title="View chat"
              variant="secondary"
              size="small"
              onPress={() => goTo('/chat/[id]')}
            />
            <Button
              title="View summary"
              size="small"
              icon="summary"
              onPress={() => goTo('/chat/[id]/summary')}
            />
          </>
        }
      />
      <Dialog
        visible={status === 'pending' || status === 'rejected'}
        title={status === 'pending' ? 'Approval pending' : 'Request declined'}
        message={
          status === 'pending'
            ? 'This chat opens once everyone involved has accepted. Check Notifications for who is still pending.'
            : 'Someone declined this request, so the chat will not open. You can send a new request from Home.'
        }
        onClose={close}
        actions={<Button title="OK" size="small" onPress={close} />}
      />
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
});
