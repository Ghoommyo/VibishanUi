import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  /** Wrap content in a ScrollView. Turn off for screens that manage their own list. */
  scroll?: boolean;
  /** Safe-area edges to pad. Screens under a navigator header usually skip 'top'. */
  edges?: Edge[];
  contentStyle?: ViewStyle;
}>;

/** Themed, keyboard-aware page wrapper that centres content and caps its width on large screens. */
export function Screen({ children, scroll = true, edges = ['bottom', 'left', 'right'], contentStyle }: ScreenProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={edges}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
