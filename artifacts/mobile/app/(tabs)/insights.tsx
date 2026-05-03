import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { diffDays, useCycle } from "@/context/CycleContext";
import { useColors } from "@/hooks/useColors";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cycles, averageCycleLength, averagePeriodLength, logs } = useCycle();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const cycleStats = useMemo(() => {
    if (cycles.length === 0) return null;
    const lengths: number[] = [];
    for (let i = 1; i < cycles.length; i++) {
      lengths.push(diffDays(cycles[i - 1].startDate, cycles[i].startDate));
    }
    const shortest = lengths.length > 0 ? Math.min(...lengths) : null;
    const longest = lengths.length > 0 ? Math.max(...lengths) : null;
    return { shortest, longest, count: cycles.length };
  }, [cycles]);

  const symptomFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const log of logs) {
      for (const s of log.symptoms) {
        freq[s] = (freq[s] ?? 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [logs]);

  const moodFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const log of logs) {
      if (log.mood) freq[log.mood] = (freq[log.mood] ?? 0) + 1;
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const maxSymptomCount = symptomFrequency[0]?.[1] ?? 1;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Insights
      </Text>

      {cycles.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="bar-chart-2" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            No data yet
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Start logging your cycle to see insights and patterns here.
          </Text>
        </View>
      ) : (
        <>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="activity"
              label="Avg Cycle"
              value={`${averageCycleLength}d`}
              sub="length"
              colors={colors}
              accent={colors.primary}
            />
            <StatCard
              icon="droplet"
              label="Avg Period"
              value={`${averagePeriodLength}d`}
              sub="duration"
              colors={colors}
              accent={colors.primary}
            />
            <StatCard
              icon="repeat"
              label="Cycles"
              value={`${cycleStats?.count ?? 0}`}
              sub="tracked"
              colors={colors}
              accent={colors.accent}
            />
            <StatCard
              icon="file-text"
              label="Logs"
              value={`${logs.length}`}
              sub="entries"
              colors={colors}
              accent={colors.accent}
            />
          </View>

          {/* Cycle length range */}
          {cycleStats && cycleStats.shortest !== null && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Cycle Range
              </Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeItem}>
                  <Text style={[styles.rangeValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {cycleStats.shortest}d
                  </Text>
                  <Text style={[styles.rangeLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Shortest
                  </Text>
                </View>
                <View style={[styles.rangeDivider, { backgroundColor: colors.border }]} />
                <View style={styles.rangeItem}>
                  <Text style={[styles.rangeValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {averageCycleLength}d
                  </Text>
                  <Text style={[styles.rangeLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Average
                  </Text>
                </View>
                <View style={[styles.rangeDivider, { backgroundColor: colors.border }]} />
                <View style={styles.rangeItem}>
                  <Text style={[styles.rangeValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {cycleStats.longest}d
                  </Text>
                  <Text style={[styles.rangeLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Longest
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Top symptoms */}
          {symptomFrequency.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Common Symptoms
              </Text>
              <View style={styles.barChart}>
                {symptomFrequency.map(([symptom, count]) => (
                  <View key={symptom} style={styles.barRow}>
                    <Text style={[styles.barLabel, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {symptom}
                    </Text>
                    <View style={styles.barTrackWrap}>
                      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${(count / maxSymptomCount) * 100}%` as any,
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barCount, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                        {count}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Mood breakdown */}
          {moodFrequency.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Mood Breakdown
              </Text>
              <View style={styles.moodBreakdown}>
                {moodFrequency.map(([m, count]) => (
                  <View key={m} style={[styles.moodPill, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.moodPillLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {m}
                    </Text>
                    <Text style={[styles.moodPillCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {count}×
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Cycle history */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Cycle History
            </Text>
            <View style={styles.history}>
              {[...cycles].reverse().map((cycle, idx) => {
                const periodLen = cycle.endDate
                  ? diffDays(cycle.startDate, cycle.endDate) + 1
                  : null;
                const nextCycle = cycles[cycles.length - 1 - idx - 1];
                const cycleLen = nextCycle
                  ? null
                  : null;
                void cycleLen;
                return (
                  <View
                    key={cycle.id}
                    style={[styles.historyRow, { borderBottomColor: colors.border }]}
                  >
                    <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyDate, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                        {formatShortDate(cycle.startDate)}
                        {cycle.endDate ? ` – ${formatShortDate(cycle.endDate)}` : " (ongoing)"}
                      </Text>
                      {periodLen !== null && (
                        <Text style={[styles.historySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {periodLen} day period
                        </Text>
                      )}
                    </View>
                    {idx === 0 && (
                      <View style={[styles.historyBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.historyBadgeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                          Latest
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatCard({
  icon, label, value, sub, colors, accent,
}: {
  icon: string; label: string; value: string; sub: string;
  colors: ReturnType<typeof useColors>; accent: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: accent + "20" }]}>
        <Feather name={icon as any} size={15} color={accent} />
      </View>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.statSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {sub}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 30, marginBottom: 22 },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { fontSize: 17, marginTop: 6 },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 3,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 22 },
  statSub: { fontSize: 11 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    gap: 14,
  },
  cardTitle: { fontSize: 15 },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  rangeItem: { alignItems: "center", gap: 4 },
  rangeValue: { fontSize: 24 },
  rangeLabel: { fontSize: 12 },
  rangeDivider: { width: 1, height: 36 },
  barChart: { gap: 10 },
  barRow: { gap: 6 },
  barLabel: { fontSize: 13 },
  barTrackWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { fontSize: 12, width: 20, textAlign: "right" },
  moodBreakdown: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  moodPillLabel: { fontSize: 13 },
  moodPillCount: { fontSize: 12 },
  history: { gap: 0 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyInfo: { flex: 1, gap: 2 },
  historyDate: { fontSize: 14 },
  historySub: { fontSize: 12 },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: { fontSize: 11 },
});
