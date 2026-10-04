import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { roomsApi, type PublicUser } from '@/api';
import { CLOSURE_LABEL } from '@/api/rooms';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { StarRating } from '@/components/ui/star-rating';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/constants/roles';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentUser } from '@/providers/session';

const CLOSURE_HELP = {
  member: 'Share your conclusion. After submitting you can still read the chat but not send messages.',
  listener: 'Share your observation from this session. After submitting you can only read the chat.',
  moderator: 'Give your verdict. This closes the chat for everyone.',
} as const;

const nameOf = (u: PublicUser) => u.profile.name || u.username;

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useCurrentUser();
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const listRef = useRef<FlatList>(null);

  const room = useApi(() => roomsApi.getRoom(id), `room:${id}`, { pollMs: 3000 });
  const messages = useApi(() => roomsApi.listMessages(id), `messages:${id}`, { pollMs: 2000 });

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [muteTarget, setMuteTarget] = useState<PublicUser | null>(null);
  const [ratingDismissed, setRatingDismissed] = useState(false);

  const detail = room.data;
  if (room.error && !detail) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary">{room.error.message}</ThemedText>
      </ThemedView>
    );
  }
  if (!detail) return <ActivityIndicator style={styles.loading} />;

  const { room: r, members, myRole } = detail;
  const others = members.filter((m) => m.id !== me.id);
  const isClosed = r.status === 'closed';
  const canSubmit = r.status === 'active' && !detail.hasSubmitted;
  const isModerator = myRole === 'moderator';
  const title =
    r.kind === 'listen' ? nameOf(others[0]) : `Group · ${nameOf(members.find((m) => m.id === r.providerId) ?? members[0])}`;
  const selecting = selection.length > 0;
  const muteTargetId = muteTarget?.id;
  const targetMuted = muteTargetId ? r.mutedIds.includes(muteTargetId) : false;
  const provider = members.find((m) => m.id === r.providerId) ?? members[0];
  const allSelectedStarred =
    selecting && selection.every((mid) => messages.data?.find((m) => m.id === mid)?.starredBy.includes(me.id));

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      await roomsApi.sendMessage(id, text);
      setDraft('');
      await messages.refetch();
    } catch (e) {
      setError(errorMessage(e));
      room.refetch();
    } finally {
      setSending(false);
    }
  };

  const toggleSelect = (messageId: string) =>
    setSelection((s) => (s.includes(messageId) ? s.filter((x) => x !== messageId) : [...s, messageId]));

  const applyStar = async () => {
    const target = !allSelectedStarred;
    const toToggle = selection.filter(
      (mid) => messages.data?.find((m) => m.id === mid)?.starredBy.includes(me.id) !== target,
    );
    await Promise.all(toToggle.map((mid) => roomsApi.toggleStar(mid)));
    setSelection([]);
    messages.refetch();
  };

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen
        options={{
          title,
          headerRight: () =>
            canSubmit ? <Button title="Submit" size="small" variant="ghost" onPress={() => setSubmitOpen(true)} /> : null,
        }}
      />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}>
        <View style={styles.column}>
          {/* Members: the moderator taps one to mute or unmute them. */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.membersBar, { borderColor: theme.border }]}
            contentContainerStyle={styles.members}>
            {members.map((m) => {
              const muted = r.mutedIds.includes(m.id);
              const tappable = isModerator && m.id !== me.id && r.status === 'active';
              return (
                <Pressable
                  key={m.id}
                  disabled={!tappable}
                  onPress={() => setMuteTarget(m)}
                  accessibilityRole={tappable ? 'button' : undefined}
                  accessibilityLabel={`${nameOf(m)}${muted ? ', muted' : ''}${tappable ? '. Tap to manage' : ''}`}
                  style={styles.member}>
                  <View>
                    <Avatar user={m} size={36} dimmed={muted} />
                    {muted && (
                      <View style={[styles.mutedBadge, { backgroundColor: theme.danger }]}>
                        <Icon name="muted" size={10} tintColor="#ffffff" />
                      </View>
                    )}
                  </View>
                  <ThemedText type="small" numberOfLines={1} style={styles.memberName}>
                    {m.id === me.id ? 'You' : nameOf(m).split(' ')[0]}
                  </ThemedText>
                  <ThemedText style={[styles.memberRole, { color: theme.textSecondary }]}>
                    {m.id === r.providerId ? (r.kind === 'listen' ? 'Listener' : 'Moderator') : r.closures[m.id] ? 'Left' : ''}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {selecting ? (
            <View style={[styles.selectionBar, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small">{selection.length} selected</ThemedText>
              <View style={styles.row}>
                <Button title="Cancel" size="small" variant="ghost" onPress={() => setSelection([])} />
                <Button title={allSelectedStarred ? 'Unstar' : 'Star'} size="small" icon="star" onPress={applyStar} />
              </View>
            </View>
          ) : (
            r.status === 'active' && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                Long-press messages to star them for the summary.
              </ThemedText>
            )
          )}

          <FlatList
            ref={listRef}
            data={messages.data ?? []}
            keyExtractor={(m) => m.id}
            style={styles.fill}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                No messages yet. Say hello!
              </ThemedText>
            }
            renderItem={({ item, index }) => {
              const prev = messages.data?.[index - 1];
              return (
                <MessageBubble
                  message={item}
                  mine={item.senderId === me.id}
                  showSender={item.senderId !== me.id && r.kind === 'moderate' && prev?.senderId !== item.senderId}
                  starred={item.starredBy.length > 0}
                  selected={selection.includes(item.id)}
                  onLongPress={r.status === 'active' ? () => toggleSelect(item.id) : undefined}
                  onPress={selecting ? () => toggleSelect(item.id) : undefined}
                />
              );
            }}
          />

          <SafeAreaView edges={['bottom']}>
            {isClosed ? (
              <View style={[styles.footer, { borderColor: theme.border }]}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                  This chat is closed.
                </ThemedText>
                <View style={styles.row}>
                  <Button
                    title="View summary"
                    variant="secondary"
                    icon="summary"
                    style={styles.flex}
                    onPress={() => router.replace({ pathname: '/chat/[id]/summary', params: { id } })}
                  />
                  <Button title="Close chat" style={styles.flex} onPress={() => router.back()} />
                </View>
              </View>
            ) : detail.canSend ? (
              <View style={[styles.composer, { borderColor: theme.border }]}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Type a message"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                  onSubmitEditing={Platform.OS === 'web' ? send : undefined}
                  submitBehavior={Platform.OS === 'web' ? 'submit' : undefined}
                />
                <Pressable
                  onPress={send}
                  disabled={!draft.trim() || sending}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  style={[
                    styles.send,
                    { backgroundColor: theme.primary, opacity: !draft.trim() || sending ? 0.4 : 1 },
                  ]}>
                  <Icon name="send" size={20} tintColor={theme.onPrimary} />
                </Pressable>
              </View>
            ) : (
              // Composer stays visible but disabled, with the reason.
              <View style={[styles.composer, { borderColor: theme.border }]}>
                <View style={[styles.input, styles.disabledInput, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {detail.sendBlockedReason}
                  </ThemedText>
                </View>
                <View style={[styles.send, { backgroundColor: theme.border }]} accessibilityState={{ disabled: true }}>
                  <Icon name={r.mutedIds.includes(me.id) ? 'muted' : 'lock'} size={20} color="textSecondary" />
                </View>
              </View>
            )}
            {error && (
              <ThemedText type="small" style={[styles.error, { color: theme.danger }]}>
                {error}
              </ThemedText>
            )}
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>

      <SubmitDialog
        visible={submitOpen}
        label={CLOSURE_LABEL[myRole]}
        help={CLOSURE_HELP[myRole]}
        onClose={() => setSubmitOpen(false)}
        onSubmit={async (text) => {
          await roomsApi.submitClosure(id, text);
          setSubmitOpen(false);
          room.refetch();
        }}
      />

      <Dialog
        visible={muteTarget !== null}
        title={muteTarget ? nameOf(muteTarget) : ''}
        message={
          targetMuted
            ? 'They are muted and cannot send messages.'
            : 'Muting stops them from sending messages until you unmute them.'
        }
        onClose={() => setMuteTarget(null)}
        actions={
          <>
            <Button title="Cancel" variant="secondary" size="small" onPress={() => setMuteTarget(null)} />
            <Button
              title={targetMuted ? 'Unmute' : 'Mute'}
              variant={targetMuted ? 'primary' : 'danger'}
              size="small"
              icon="muted"
              onPress={async () => {
                if (!muteTargetId) return;
                await roomsApi.setMuted(id, muteTargetId, !targetMuted);
                setMuteTarget(null);
                room.refetch();
              }}
            />
          </>
        }
      />

      <RatingDialog
        visible={detail.needsRating && !ratingDismissed}
        provider={provider}
        kind={r.kind}
        onLater={() => setRatingDismissed(true)}
        onSubmit={async (stars, feedback) => {
          await roomsApi.rate(id, stars, feedback);
          room.refetch();
        }}
      />
    </ThemedView>
  );
}

function SubmitDialog({
  visible,
  label,
  help,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  label: string;
  help: string;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) {
      setError(`Write your ${label.toLowerCase()} first.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(text);
      setText('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      title={label}
      message={help}
      onClose={onClose}
      actions={
        <>
          <Button title="Cancel" variant="secondary" size="small" onPress={onClose} />
          <Button title="Close & submit" size="small" loading={busy} onPress={submit} />
        </>
      }>
      <TextField
        label={label}
        value={text}
        onChangeText={(t) => {
          setText(t);
          setError(null);
        }}
        multiline
        autoFocus
        maxLength={1000}
      />
      {error && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      )}
    </Dialog>
  );
}

function RatingDialog({
  visible,
  provider,
  kind,
  onLater,
  onSubmit,
}: {
  visible: boolean;
  provider: PublicUser;
  kind: 'listen' | 'moderate';
  onLater: () => void;
  onSubmit: (stars: number, feedback: string) => Promise<void>;
}) {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  return (
    <Dialog
      visible={visible}
      title={`Rate your ${kind === 'listen' ? 'listener' : 'moderator'}`}
      message={`The chat is closed. How was your session with ${nameOf(provider)}?`}
      onClose={onLater}
      actions={
        <>
          <Button title="Later" variant="secondary" size="small" onPress={onLater} />
          <Button
            title="Submit"
            size="small"
            loading={busy}
            disabled={stars === 0}
            onPress={async () => {
              setBusy(true);
              try {
                await onSubmit(stars, feedback);
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      }>
      <View style={styles.ratingStars}>
        <StarRating value={stars} size={36} onChange={setStars} />
      </View>
      <TextField
        label="Feedback (optional)"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        maxLength={500}
        placeholder="What went well? What could be better?"
      />
      {error && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      )}
    </Dialog>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  loading: {
    marginTop: Spacing.six,
  },
  membersBar: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  members: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  member: {
    alignItems: 'center',
    width: 64,
    gap: Spacing.half,
  },
  memberName: {
    fontSize: 12,
    lineHeight: 16,
  },
  memberRole: {
    fontSize: 10,
    lineHeight: 12,
  },
  mutedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingVertical: Spacing.one,
    fontSize: 12,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  messages: {
    paddingVertical: Spacing.two,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + Spacing.half,
    paddingBottom: Spacing.two + Spacing.half,
    fontSize: 16,
  },
  disabledInput: {
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  centerText: {
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  error: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  ratingStars: {
    alignItems: 'center',
  },
});
