import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MessageWithSender } from '@/api/rooms';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clockTime } from '@/utils/time';

type MessageBubbleProps = {
  message: MessageWithSender;
  mine: boolean;
  /** Show the sender's name above the bubble (group chats, others' messages). */
  showSender: boolean;
  starred: boolean;
  selected: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function MessageBubble({ message, mine, showSender, starred, selected, onPress, onLongPress }: MessageBubbleProps) {
  const theme = useTheme();
  const foreground = mine ? theme.onPrimary : theme.text;
  const secondary = mine ? 'rgba(255,255,255,0.75)' : theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityLabel={`${mine ? 'You' : message.sender.profile.name}: ${message.text}${starred ? ', starred' : ''}`}
      accessibilityState={{ selected }}
      style={[styles.row, mine ? styles.mine : styles.theirs, selected && { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.bubble, { backgroundColor: mine ? theme.primary : theme.backgroundElement }]}>
        {showSender && (
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {message.sender.profile.name || message.sender.username}
          </ThemedText>
        )}
        <ThemedText type="small" style={{ color: foreground }}>
          {message.text}
        </ThemedText>
        <View style={styles.meta}>
          {starred && <Text style={[styles.star, { color: mine ? '#FFE08A' : theme.star }]}>★</Text>}
          <ThemedText style={[styles.time, { color: secondary }]}>{clockTime(message.createdAt)}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.half,
  },
  mine: {
    alignItems: 'flex-end',
  },
  theirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  meta: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: Spacing.one,
  },
  star: {
    fontSize: 12,
    lineHeight: 14,
  },
  time: {
    fontSize: 11,
    lineHeight: 14,
  },
});
