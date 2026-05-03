import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCycle } from "@/context/CycleContext";
import { useColors } from "@/hooks/useColors";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function shortDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentCycleDay,
    phaseName,
    phaseDescription,
    phase,
    nextPeriodDate,
    daysUntilNextPeriod,
    fertileStart,
    fertileEnd,
    ovulationDate,
    isInPeriod,
    isFertile,
    cycles,
    averageCycleLength,
    averagePeriodLength,
    startPeriod,
    endPeriod,
    todayLog,
    todayStr,
  } = useCycle();

  const hasTracking = cycles.length > 0;

  const phaseColor =
    phase === "period"
      ? colors.primary
      : phase === "fertile" || phase === "ovulation"
      ? colors.accent
      : colors.secondary;

  const phaseTextColor =
    phase === "period"
      ? colors.primaryForeground
      : phase === "fertile" || phase === "ovulation"
      ? colors.accentForeground
      : colors.foreground;

  const progressFillColor =
    phase === "period" || phase === "fertile" || phase === "ovulation"
      ? "rgba(255,255,255,0.75)"
      : colors.primary;

  const progressPct = Math.min((currentCycleDay / averageCycleLength) * 100, 100);

  const handleStartPeriod = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startPeriod();
  };

  const handleEndPeriod = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await endPeriod();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {getGreeting()}
      </Text>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        My Cycle
      </Text>

      {/* Phase card */}
      <View style={[styles.phaseCard, { backgroundColor: phaseColor }]}>
        {hasTracking ? (
          <View style={styles.phaseInner}>
            <Text style={[styles.dayLabel, { color: phaseTextColor, fontFamily: "Inter_400Regular" }]}>
              Cycle Day
            </Text>
            <Text style={[styles.dayNumber, { color: phaseTextColor, fontFamily: "Inter_700Bold" }]}>
              {currentCycleDay}
            </Text>
            <Text style={[styles.phaseName, { color: phaseTextColor, fontFamily: "Inter_600SemiBold" }]}>
              {phaseName}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPct}%` as any, backgroundColor: progressFillColor },
                ]}
              />
            </View>
            <Text style={[styles.phaseDesc, { color: phaseTextColor, fontFamily: "Inter_400Regular" }]}>
              {phaseDescription}
            </Text>
          </View>
        ) : (
          <View style={[styles.phaseInner, styles.noTrackingInner]}>
            <Feather name="moon" size={44} color={colors.mutedForeground} />
            <Text style={[styles.noTrackingText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              Start tracking
            </Text>
            <Text style={[styles.noTrackingDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Log your first period to begin
            </Text>
          </View>
        )}
      </View>

      {/* Period action */}
      {!isInPeriod ? (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleStartPeriod}
          activeOpacity={0.82}
        >
          <Feather name="droplet" size={18} color={colors.primaryForeground} />
          <Text style={[styles.actionBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
            Period Started Today
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]}
          onPress={handleEndPeriod}
          activeOpacity={0.82}
        >
          <Feather name="check-circle" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            Period Ended Today
          </Text>
        </TouchableOpacity>
      )}

      {/* Info grid */}
      {hasTracking && (
        <>
          <View style={styles.infoGrid}>
            <InfoCard
              icon="calendar"
              iconBg={colors.secondary}
              iconColor={colors.primary}
              label="Next Period"
              value={
                daysUntilNextPeriod !== null && daysUntilNextPeriod > 0
                  ? `${daysUntilNextPeriod}d`
                  : daysUntilNextPeriod === 0
                  ? "Today"
                  : "Due"
              }
              sub={shortDate(nextPeriodDate)}
              colors={colors}
            />
            <InfoCard
              icon="sun"
              iconBg="#E5F3EF"
              iconColor={colors.accent}
              label="Fertile Window"
              value={isFertile ? "Now" : fertileStart ? shortDate(fertileStart) : "—"}
              sub={
                fertileStart && fertileEnd
                  ? `${shortDate(fertileStart)} – ${shortDate(fertileEnd)}`
                  : "—"
              }
              colors={colors}
            />
            <InfoCard
              icon="activity"
              iconBg={colors.secondary}
              iconColor={colors.primary}
              label="Cycle Length"
              value={`${averageCycleLength}d`}
              sub="average"
              colors={colors}
            />
            <InfoCard
              icon="heart"
              iconBg="#E5F3EF"
              iconColor={colors.accent}
              label="Period Length"
              value={`${averagePeriodLength}d`}
              sub="average"
              colors={colors}
            />
          </View>

          {/* Ovulation */}
          {ovulationDate && (
            <View
              style={[
                styles.ovulationBanner,
                {
                  backgroundColor:
                    todayStr === ovulationDate ? colors.accent : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather
                name="sun"
                size={16}
                color={todayStr === ovulationDate ? colors.accentForeground : colors.accent}
              />
              <Text
                style={[
                  styles.ovulationText,
                  {
                    color:
                      todayStr === ovulationDate
                        ? colors.accentForeground
                        : colors.foreground,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {todayStr === ovulationDate
                  ? "Ovulation day — peak fertility"
                  : `Predicted ovulation: ${shortDate(ovulationDate)}`}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Today's log summary */}
      {todayLog && (todayLog.symptoms.length > 0 || todayLog.mood) && (
        <View style={[styles.logSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.logSummaryTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Today&apos;s Log
          </Text>
          {todayLog.mood && (
            <View style={styles.logRow}>
              <Feather name="smile" size={14} color={colors.mutedForeground} />
              <Text style={[styles.logRowText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Feeling {todayLog.mood.toLowerCase()}
              </Text>
            </View>
          )}
          {todayLog.symptoms.length > 0 && (
            <View style={styles.logRow}>
              <Feather name="list" size={14} color={colors.mutedForeground} />
              <Text style={[styles.logRowText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {todayLog.symptoms.join(", ")}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function InfoCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  colors,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.infoIconWrap, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={15} color={iconColor} />
      </View>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.infoSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {sub}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  greeting: { fontSize: 13, marginBottom: 2 },
  title: { fontSize: 30, marginBottom: 22 },
  phaseCard: { borderRadius: 24, marginBottom: 16, overflow: "hidden" },
  phaseInner: { padding: 28, alignItems: "center", gap: 6 },
  noTrackingInner: { gap: 10 },
  dayLabel: { fontSize: 13, opacity: 0.85 },
  dayNumber: { fontSize: 64, lineHeight: 70 },
  phaseName: { fontSize: 17 },
  progressTrack: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressFill: { height: 4, borderRadius: 2 },
  phaseDesc: { fontSize: 13, textAlign: "center", opacity: 0.88, lineHeight: 19 },
  noTrackingText: { fontSize: 16, marginTop: 6 },
  noTrackingDesc: { fontSize: 13, textAlign: "center" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
  },
  actionBtnText: { fontSize: 15 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  infoCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 3,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 21 },
  infoSub: { fontSize: 11 },
  ovulationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  ovulationText: { fontSize: 13, flex: 1 },
  logSummary: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  logSummaryTitle: { fontSize: 14, marginBottom: 2 },
  logRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logRowText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
