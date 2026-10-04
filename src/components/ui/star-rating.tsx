import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type StarRatingProps = {
  /** 0–5; fractional values round to the nearest star. */
  value: number;
  size?: number;
  /** Makes the stars tappable. */
  onChange?: (stars: number) => void;
};

// Text glyphs rather than icons, so filled and empty stars look the same on every platform.
export function StarRating({ value, size = 16, onChange }: StarRatingProps) {
  const theme = useTheme();
  const filled = Math.round(value);
  return (
    <View
      style={styles.row}
      accessibilityRole={onChange ? 'adjustable' : 'image'}
      accessibilityLabel={`${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const glyph = (
          <Text style={{ fontSize: size, lineHeight: size * 1.2, color: star <= filled ? theme.star : theme.border }}>
            ★
          </Text>
        );
        return onChange ? (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={4} accessibilityLabel={`${star} stars`}>
            {glyph}
          </Pressable>
        ) : (
          <View key={star}>{glyph}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
