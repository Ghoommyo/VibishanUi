import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, label }: SegmentedControlProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      )}
      <View accessibilityRole="radiogroup" style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && { backgroundColor: theme.background, borderColor: theme.border }]}>
              <ThemedText type={selected ? 'smallBold' : 'small'} themeColor={selected ? 'text' : 'textSecondary'}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one + Spacing.half,
  },
  track: {
    flexDirection: 'row',
    borderRadius: Spacing.three - Spacing.one,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two + Spacing.half,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
