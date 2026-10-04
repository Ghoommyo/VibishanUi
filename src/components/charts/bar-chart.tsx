import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BarDatum = { label: string; value: number };

type BarChartProps = {
  data: BarDatum[];
  /** Describes what is plotted, for screen readers (e.g. "Sessions completed per week"). */
  title: string;
  height?: number;
  formatValue?: (value: number) => string;
};

const AXIS_WIDTH = 28;
const LABEL_HEIGHT = 20;
const TOP_PAD = 8;
const MAX_BAR = 24;
const RADIUS = 4;
// SVG text doesn't inherit the app font; on web it would fall back to a serif face.
const FONT_FAMILY = Platform.select({ web: 'Inter, system-ui, -apple-system, sans-serif', default: undefined });

/** Rounded at the data end, square at the baseline. */
function barPath(x: number, y: number, width: number, baseline: number) {
  const r = Math.min(RADIUS, width / 2, baseline - y);
  return `M${x},${baseline} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${baseline} Z`;
}

/** Whole-number ticks: 0 and up to four clean steps at or above the max. */
function ticksFor(max: number) {
  const target = Math.max(max, 1);
  const rawStep = target / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? magnitude * 10);
  const top = Math.ceil(target / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

/**
 * Single-series column chart drawn with react-native-svg. One colour, no legend (the title names the series).
 * Tap (or hover on web) a column to see its value.
 */
export function BarChart({ data, title, height = 180, formatValue = String }: BarChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const ticks = ticksFor(Math.max(...data.map((d) => d.value), 0));
  const top = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - AXIS_WIDTH, 0);
  const baseline = height - LABEL_HEIGHT;
  const plotHeight = baseline - TOP_PAD;
  const band = data.length ? plotWidth / data.length : 0;
  const barWidth = Math.min(MAX_BAR, band * 0.6);
  const yFor = (v: number) => baseline - (v / top) * plotHeight;

  const activeDatum = active !== null ? data[active] : null;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${title}. ${data.map((d) => `${d.label}: ${formatValue(d.value)}`).join(', ')}`}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {ticks.map((t) => (
            <Line
              key={t}
              x1={AXIS_WIDTH}
              x2={width}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke={theme.border}
              strokeWidth={1}
            />
          ))}
          {ticks.map((t) => (
            <SvgText
              key={`t${t}`}
              x={AXIS_WIDTH - 6}
              y={yFor(t) + 4}
              fontSize={11}
              fontFamily={FONT_FAMILY}
              fill={theme.textSecondary}
              textAnchor="end">
              {t}
            </SvgText>
          ))}
          {data.map((d, i) => {
            const x = AXIS_WIDTH + i * band + (band - barWidth) / 2;
            return (
              <Path
                key={d.label}
                d={barPath(x, yFor(d.value), barWidth, baseline)}
                fill={theme.chart}
                opacity={active === null || active === i ? 1 : 0.45}
              />
            );
          })}
          {data.map((d, i) => (
            <SvgText
              key={`l${d.label}`}
              x={AXIS_WIDTH + i * band + band / 2}
              y={height - 4}
              fontSize={11}
              fontFamily={FONT_FAMILY}
              fill={active === i ? theme.text : theme.textSecondary}
              fontWeight={active === i ? '700' : '400'}
              textAnchor="middle">
              {d.label}
            </SvgText>
          ))}
        </Svg>
      )}

      {/* Hit targets span the whole column slot, larger than the bar itself. */}
      <View style={[StyleSheet.absoluteFill, styles.hitRow, { left: AXIS_WIDTH }]}>
        {data.map((d, i) => (
          <Pressable
            key={d.label}
            style={styles.hit}
            // On web a click arrives after hover already selected the bar, so it must not toggle it off.
            onPress={() => setActive(Platform.OS === 'web' || active !== i ? i : null)}
            onHoverIn={() => setActive(i)}
            onHoverOut={() => setActive(null)}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        ))}
      </View>

      {activeDatum && active !== null && (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              backgroundColor: theme.text,
              left: Math.min(Math.max(AXIS_WIDTH + active * band + band / 2 - 50, 0), Math.max(width - 100, 0)),
              top: Math.max(yFor(activeDatum.value) - 44, 0),
            },
          ]}>
          <ThemedText style={[styles.tooltipText, { color: theme.background }]}>
            {activeDatum.label}: {formatValue(activeDatum.value)}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hitRow: {
    flexDirection: 'row',
  },
  hit: {
    flex: 1,
  },
  tooltip: {
    position: 'absolute',
    width: 100,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 600,
  },
});
