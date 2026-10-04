import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export function TextField({ label, error, hint, style, multiline, ...rest }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {label && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one + Spacing.half,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    fontSize: 16,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
