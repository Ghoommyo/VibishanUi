import { Pressable, StyleSheet, View } from 'react-native';

import type { RoomListItem } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { StatusPill } from '@/components/ui/status-pill';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { shortTime } from '@/utils/time';

type ChatRowProps = {
  item: RoomListItem;
  showPreview: boolean;
  onPress: () => void;
};

const firstName = (name: string) => name.split(' ')[0];

export function ChatRow({ item, showPreview, onPress }: ChatRowProps) {
  const theme = useTheme();
  const { room, others, lastMessage } = item;
  const lead = others.find((u) => u.id === room.providerId) ?? others[0];
  const title =
    room.kind === 'listen'
      ? lead.profile.name || lead.username
      : others.map((u) => firstName(u.profile.name || u.username)).join(', ');

  let subtitle: string;
  if (room.status === 'pending') subtitle = 'Approval pending';
  else if (room.status === 'rejected') subtitle = 'Request declined';
  else if (!lastMessage) subtitle = 'No messages yet';
  else if (!showPreview) subtitle = room.status === 'closed' ? 'Chat closed' : 'Open chat';
  else {
    const sender = others.find((u) => u.id === lastMessage.senderId);
    subtitle = `${sender ? firstName(sender.profile.name || sender.username) : 'You'}: ${lastMessage.text}`;
  }

  const enterable = room.status === 'active' || room.status === 'closed';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={enterable ? 'Opens the chat' : 'This chat is not open yet'}
      style={({ pressed }) => [styles.row, { borderColor: theme.border }, pressed && { backgroundColor: theme.backgroundElement }]}>
      <View>
        <Avatar user={lead} size={52} dimmed={!enterable} />
        <View style={[styles.kind, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Icon name={room.kind === 'listen' ? 'listener' : 'moderator'} size={12} color="textSecondary" />
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.line}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {shortTime(item.lastActivity)}
          </ThemedText>
        </View>
        <View style={styles.line}>
          <View style={styles.subtitle}>
            {room.status === 'pending' && <Icon name="hourglass" size={14} color="warning" />}
            {room.status === 'closed' && <Icon name="lock" size={14} color="textSecondary" />}
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.title}>
              {subtitle}
            </ThemedText>
          </View>
          {room.status !== 'active' && <StatusPill status={room.status} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kind: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
