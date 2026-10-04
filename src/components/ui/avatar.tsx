import { StyleSheet, View } from 'react-native';

import type { PublicUser } from '@/api';
import { ThemedText } from '@/components/themed-text';

// Fixed hues that read well with white initials in both themes.
const PALETTE = ['#208AEF', '#7C5CDB', '#1E9E5A', '#D9822B', '#D2457A', '#2A9D9F', '#6B7A8F'];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(user: Pick<PublicUser, 'username' | 'profile'>) {
  const parts = (user.profile.name || user.username).trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

type AvatarProps = {
  user: Pick<PublicUser, 'id' | 'username' | 'profile'>;
  size?: number;
  /** Dims the avatar, e.g. for a muted member. */
  dimmed?: boolean;
};

export function Avatar({ user, size = 40, dimmed = false }: AvatarProps) {
  return (
    <View
      accessibilityLabel={user.profile.name || user.username}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colorFor(user.id) },
        dimmed && styles.dimmed,
      ]}>
      <ThemedText style={{ color: '#ffffff', fontSize: size * 0.38, lineHeight: size * 0.5, fontWeight: 700 }}>
        {initials(user)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.4,
  },
});
