import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type DialogProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  /** When false, tapping the backdrop or pressing back does nothing (for required steps). */
  dismissable?: boolean;
  /** Buttons, laid out at the bottom. */
  actions?: React.ReactNode;
}>;

/** A centred modal card. RN's Modal works on iOS, Android and web. */
export function Dialog({ visible, title, message, onClose, dismissable = true, actions, children }: DialogProps) {
  const close = dismissable ? onClose : () => {};
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close dialog">
          {/* Stops taps on the card from reaching the backdrop. */}
          <Pressable onPress={() => {}} style={styles.cardWrap}>
            <ThemedView style={styles.card} accessibilityRole="alert">
              <ThemedText type="smallBold" style={styles.title}>
                {title}
              </ThemedText>
              {message && <ThemedText themeColor="textSecondary">{message}</ThemedText>}
              {children}
              {actions && <View style={styles.actions}>{actions}</View>}
            </ThemedView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  card: {
    borderRadius: Spacing.four - Spacing.one,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
