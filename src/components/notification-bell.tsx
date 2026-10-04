import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { notificationsApi } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';

export function NotificationBell() {
  const theme = useTheme();
  const { data: unread = 0 } = useApi(notificationsApi.unreadCount, 'unread', { pollMs: 3000 });

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      accessibilityRole="button"
      accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}>
      <Icon name="bell" size={24} />
      {unread > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.background }]}>
          <ThemedText style={styles.badgeText}>{unread > 9 ? '9+' : unread}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: Spacing.two,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 700,
  },
});
