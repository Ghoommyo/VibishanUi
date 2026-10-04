import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { ROLE_LABEL } from '@/constants/roles';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentUser, useSession } from '@/providers/session';

export function DrawerContent(props: DrawerContentComponentProps) {
  const user = useCurrentUser();
  const { signOut } = useSession();
  const theme = useTheme();

  return (
    <DrawerContentScrollView {...props}>
      <View style={[styles.header, { borderColor: theme.border }]}>
        <Avatar user={user} size={56} />
        <View style={styles.headerText}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {user.profile.name || user.username}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            @{user.username} · {ROLE_LABEL[user.role]}
          </ThemedText>
        </View>
      </View>
      <DrawerItemList {...props} />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <DrawerItem
        label="Log out"
        labelStyle={{ color: theme.danger }}
        icon={() => <Icon name="logout" color="danger" />}
        onPress={signOut}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    marginBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
    marginHorizontal: Spacing.three,
  },
});
