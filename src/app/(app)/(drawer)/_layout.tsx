import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions, type ColorValue } from 'react-native';

import { DrawerContent } from '@/components/drawer-content';
import { NotificationBell } from '@/components/notification-bell';
import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

const WIDE_BREAKPOINT = 1024;

function drawerIcon(name: IconName) {
  return function DrawerIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} tintColor={color} />;
  };
}

export default function DrawerLayout() {
  const theme = useTheme();
  const isWide = useWindowDimensions().width >= WIDE_BREAKPOINT;

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        // On wide screens (mostly web) the menu stays open beside the content.
        drawerType: isWide ? 'permanent' : 'front',
        headerLeft: isWide ? () => null : undefined,
        headerRight: () => <NotificationBell />,
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.text,
        drawerStyle: { backgroundColor: theme.background, borderColor: theme.border },
      }}>
      <Drawer.Screen name="home" options={{ title: 'Home', drawerIcon: drawerIcon('home') }} />
      <Drawer.Screen name="chats" options={{ title: 'Chatrooms', drawerIcon: drawerIcon('chats') }} />
      <Drawer.Screen name="profile" options={{ title: 'Profile', drawerIcon: drawerIcon('person') }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings', drawerIcon: drawerIcon('settings') }} />
    </Drawer>
  );
}
