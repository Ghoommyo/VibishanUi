import { StyleSheet, View } from 'react-native';

import type { ApprovalState, RoomStatus } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Status = ApprovalState | RoomStatus;

const LABEL: Record<Status, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Declined',
  active: 'Active',
  closed: 'Closed',
};

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const theme = useTheme();
  const color = {
    pending: theme.warning,
    accepted: theme.success,
    active: theme.success,
    rejected: theme.danger,
    closed: theme.textSecondary,
  }[status];

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText style={[styles.text, { color }]}>{label ?? LABEL[status]}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 600,
  },
});
