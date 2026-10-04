import { useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchableSelectProps<T> = {
  label: string;
  placeholder: string;
  items: T[] | undefined;
  loading?: boolean;
  getKey: (item: T) => string;
  /** Text shown on the closed field for a selected item. */
  getLabel: (item: T) => string;
  /** Text the search box matches against. */
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  selected: string[];
  onChange: (keys: string[]) => void;
  multiple?: boolean;
  error?: string | null;
  emptyText?: string;
};

/** A field that opens a searchable list in a dialog. Supports single or multiple selection. */
export function SearchableSelect<T>({
  label,
  placeholder,
  items,
  loading,
  getKey,
  getLabel,
  getSearchText,
  renderItem,
  selected,
  onChange,
  multiple = false,
  error,
  emptyText = 'Nothing found.',
}: SearchableSelectProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = (items ?? []).filter((item) => !q || getSearchText(item).toLowerCase().includes(q));
  const selectedItems = (items ?? []).filter((item) => selected.includes(getKey(item)));

  const toggle = (key: string) => {
    if (!multiple) {
      onChange([key]);
      setOpen(false);
      return;
    }
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedItems.map(getLabel).join(', ') || placeholder}`}
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.danger : theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
        <ThemedText
          type="small"
          themeColor={selectedItems.length ? 'text' : 'textSecondary'}
          style={styles.fieldText}
          numberOfLines={2}>
          {selectedItems.length ? selectedItems.map(getLabel).join(', ') : placeholder}
        </ThemedText>
        <Icon name="chevronDown" size={18} color="textSecondary" />
      </Pressable>
      {error && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      )}

      <Dialog
        visible={open}
        title={label}
        onClose={() => setOpen(false)}
        actions={multiple ? <Button title={`Done (${selected.length})`} size="small" onPress={() => setOpen(false)} /> : null}>
        <View style={[styles.search, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Icon name="search" size={18} color="textSecondary" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or username"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
        {loading && !items ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={getKey}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {emptyText}
              </ThemedText>
            }
            renderItem={({ item }) => {
              const key = getKey(item);
              const isSelected = selected.includes(key);
              return (
                <Pressable
                  accessibilityRole={multiple ? 'checkbox' : 'radio'}
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => toggle(key)}
                  style={({ pressed }) => [
                    styles.option,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: theme.backgroundSelected },
                    pressed && { opacity: 0.7 },
                  ]}>
                  <View style={styles.optionContent}>{renderItem(item)}</View>
                  <View
                    style={[
                      styles.check,
                      multiple ? styles.checkbox : styles.checkRound,
                      {
                        borderColor: isSelected ? theme.primary : theme.textSecondary,
                        backgroundColor: isSelected ? theme.primary : 'transparent',
                      },
                    ]}>
                    {isSelected && <Icon name="check" size={14} tintColor={theme.onPrimary} />}
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one + Spacing.half,
  },
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  fieldText: {
    flex: 1,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 16,
  },
  loading: {
    marginVertical: Spacing.four,
  },
  list: {
    maxHeight: 360,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
  },
  optionContent: {
    flex: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    borderRadius: 6,
  },
  checkRound: {
    borderRadius: 11,
  },
});
