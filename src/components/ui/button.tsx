import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: IconName;
  size?: 'regular' | 'small';
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  size = 'regular',
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const background = {
    primary: theme.primary,
    secondary: theme.backgroundElement,
    ghost: 'transparent',
    danger: theme.danger,
  }[variant];
  const foreground = variant === 'primary' || variant === 'danger' ? theme.onPrimary : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        size === 'small' && styles.small,
        { backgroundColor: background, opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={size === 'small' ? 16 : 18} tintColor={foreground} />}
          <ThemedText type={size === 'small' ? 'small' : 'smallBold'} style={{ color: foreground }}>
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two + Spacing.one,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
