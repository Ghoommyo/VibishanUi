import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type RadioOption<T extends string> = { value: T; label: string; description?: string; icon?: IconName };

type RadioGroupProps<T extends string> = {
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Radio buttons laid out as side-by-side cards. */
export function RadioGroup<T extends string>({ options, value, onChange }: RadioGroupProps<T>) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.card,
              {
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: theme.backgroundElement,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <View style={[styles.radio, { borderColor: selected ? theme.primary : theme.textSecondary }]}>
              {selected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
            </View>
            <View style={styles.text}>
              <View style={styles.titleRow}>
                {option.icon && <Icon name={option.icon} size={18} color={selected ? 'primary' : 'text'} />}
                <ThemedText type="smallBold">{option.label}</ThemedText>
              </View>
              {option.description && (
                <ThemedText type="small" themeColor="textSecondary">
                  {option.description}
                </ThemedText>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  card: {
    flex: 1,
    minWidth: 150,
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
