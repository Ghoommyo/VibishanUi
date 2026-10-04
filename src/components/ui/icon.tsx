import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

// SF Symbols on iOS, Material Symbols on Android and web.
const ICONS = {
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  menu: { ios: 'line.3.horizontal', android: 'menu', web: 'menu' },
  home: { ios: 'house', android: 'home', web: 'home' },
  chats: { ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' },
  person: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  send: { ios: 'paperplane.fill', android: 'send', web: 'send' },
  star: { ios: 'star.fill', android: 'star', web: 'star' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  listener: { ios: 'ear', android: 'hearing', web: 'hearing' },
  moderator: { ios: 'person.3', android: 'groups', web: 'groups' },
  muted: { ios: 'speaker.slash', android: 'volume_off', web: 'volume_off' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  summary: { ios: 'doc.text', android: 'description', web: 'description' },
  hourglass: { ios: 'hourglass', android: 'hourglass_empty', web: 'hourglass_empty' },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: ThemeColor;
  /** Overrides `color` with a raw colour value. */
  tintColor?: ColorValue;
};

export function Icon({ name, size = 22, color = 'text', tintColor }: IconProps) {
  const theme = useTheme();
  return <SymbolView name={ICONS[name]} size={size} tintColor={tintColor ?? theme[color]} />;
}
