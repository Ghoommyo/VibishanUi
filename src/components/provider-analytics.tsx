import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { analyticsApi } from '@/api';
import { BarChart, type BarDatum } from '@/components/charts/bar-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { timeAgo } from '@/utils/time';

export function ProviderAnalytics() {
  const { data: stats, error } = useApi(analyticsApi.getProviderStats, 'provider-stats');

  if (error && !stats) return <ThemedText themeColor="textSecondary">{error.message}</ThemedText>;
  if (!stats) return <ActivityIndicator style={styles.loading} />;

  const ratingData: BarDatum[] = stats.ratingDistribution.map((count, i) => ({ label: `${i + 1}★`, value: count }));

  return (
    <View style={styles.container}>
      <View style={styles.tiles}>
        <StatTile label="Listening sessions done" value={String(stats.listeningDone)} />
        <StatTile label="Moderation sessions done" value={String(stats.moderationDone)} />
        <StatTile
          label="Average rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : '–'}
          extra={<StarRating value={stats.averageRating ?? 0} size={14} />}
        />
        <StatTile
          label="Ratings received"
          value={String(stats.ratingCount)}
          extra={
            <ThemedText type="small" themeColor="textSecondary">
              {stats.activeSessions} active now
            </ThemedText>
          }
        />
      </View>

      <ChartCard title="Sessions completed per week" subtitle="Last 8 weeks" data={stats.weekly} />
      <ChartCard
        title="Rating distribution"
        subtitle={`${stats.ratingCount} ratings`}
        data={ratingData}
        formatValue={(v) => `${v} ${v === 1 ? 'rating' : 'ratings'}`}
      />

      <View style={styles.section}>
        <ThemedText type="smallBold">User feedback</ThemedText>
        {stats.feedback.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No written feedback yet.
          </ThemedText>
        ) : (
          stats.feedback.slice(0, 10).map((f) => (
            <ThemedView key={`${f.by.id}-${f.at}`} type="backgroundElement" style={styles.feedback}>
              <Avatar user={f.by} size={32} />
              <View style={styles.feedbackText}>
                <View style={styles.feedbackHeader}>
                  <ThemedText type="smallBold">{f.by.profile.name || f.by.username}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {timeAgo(f.at)}
                  </ThemedText>
                </View>
                <StarRating value={f.stars} size={13} />
                <ThemedText type="small">{f.text}</ThemedText>
              </View>
            </ThemedView>
          ))
        )}
      </View>

      <Link href="/chats" style={styles.link}>
        <ThemedText type="linkPrimary">Go to my chatrooms →</ThemedText>
      </Link>
    </View>
  );
}

function StatTile({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <ThemedView type="backgroundElement" style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.tileValue}>{value}</ThemedText>
      {extra}
    </ThemedView>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  formatValue,
}: {
  title: string;
  subtitle: string;
  data: BarDatum[];
  formatValue?: (v: number) => string;
}) {
  const theme = useTheme();
  const [asTable, setAsTable] = useState(false);
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>
        <Pressable onPress={() => setAsTable((t) => !t)} accessibilityRole="button" hitSlop={8}>
          <ThemedText type="small" style={{ color: theme.primary }}>
            {asTable ? 'Show chart' : 'Show table'}
          </ThemedText>
        </Pressable>
      </View>
      {asTable ? (
        <View>
          {data.map((d, i) => (
            <View
              key={d.label}
              style={[styles.tableRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {d.label}
              </ThemedText>
              <ThemedText type="small" style={styles.tabular}>
                {formatValue ? formatValue(d.value) : d.value}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <BarChart data={data} title={title} formatValue={formatValue} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  loading: {
    marginTop: Spacing.five,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  tileValue: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 600,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  section: {
    gap: Spacing.two,
  },
  feedback: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  feedbackText: {
    flex: 1,
    gap: Spacing.half,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  link: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});
