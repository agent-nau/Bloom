import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCycle } from "@/context/CycleContext";
import { useColors } from "@/hooks/useColors";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getDateStatus, todayStr, phaseName, logs } = useCycle();

  const today = new Date(todayStr + "T12:00:00");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [viewYear, viewMonth]);

  const cells = useMemo(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < days.firstDay; i++) result.push(null);
    for (let d = 1; d <= days.daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [days]);

  const formatCellDate = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const selectedLog = useMemo(() => {
    if (!selectedDate) return null;
    return logs.find((l) => l.date === selectedDate) ?? null;
  }, [selectedDate, logs]);

  const selectedStatus = useMemo(() => {
    if (!selectedDate) return null;
    return getDateStatus(selectedDate);
  }, [selectedDate, getDateStatus]);

  const selectedPhaseLabel = useMemo(() => {
    if (!selectedStatus) return null;
    if (selectedStatus.isPeriod) return "Period";
    if (selectedStatus.isPredictedPeriod) return "Predicted Period";
    if (selectedStatus.isOvulation) return "Ovulation Day";
    if (selectedStatus.isFertile) return "Fertile Window";
    return null;
  }, [selectedStatus]);

  function getDayStyle(day: number) {
    const dateStr = formatCellDate(day);
    const status = getDateStatus(dateStr);
    const isSelected = dateStr === selectedDate;

    let bg = "transparent";
    let textColor = colors.foreground;
    let borderColor = "transparent";
    let borderWidth = 0;

    if (status.isPeriod) {
      bg = colors.primary;
      textColor = colors.primaryForeground;
    } else if (status.isPredictedPeriod) {
      bg = colors.secondary;
      textColor = colors.primary;
      borderColor = colors.primary;
      borderWidth = 1;
    } else if (status.isOvulation) {
      bg = colors.accent;
      textColor = colors.accentForeground;
    } else if (status.isFertile) {
      bg = "#C8E6DE";
      textColor = "#2D6B5A";
    } else if (status.isToday) {
      borderColor = colors.primary;
      borderWidth = 2;
    }

    if (isSelected && !status.isPeriod && !status.isOvulation && !status.isFertile && !status.isPredictedPeriod) {
      bg = colors.muted;
    }

    return { bg, textColor, borderColor, borderWidth, hasLog: status.hasLog };
  }

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
        Calendar
      </Text>

      {/* Month nav */}
      <View style={[styles.monthNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={goToPrev} style={styles.navBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={goToNext} style={styles.navBtn} activeOpacity={0.7}>
          <Feather name="chevron-right" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd) => (
          <Text
            key={wd}
            style={[styles.weekday, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
          >
            {wd}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }
          const ds = getDayStyle(day);
          const dateStr = formatCellDate(day);
          const isSelected = dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                styles.dayCell,
                {
                  backgroundColor: ds.bg,
                  borderColor: ds.borderColor,
                  borderWidth: ds.borderWidth,
                  transform: isSelected ? [{ scale: 1.1 }] : [],
                },
              ]}
              onPress={() => setSelectedDate(dateStr)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: ds.textColor,
                    fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                  },
                ]}
              >
                {day}
              </Text>
              {ds.hasLog && (
                <View style={[styles.logDot, { backgroundColor: ds.textColor === colors.primaryForeground ? "rgba(255,255,255,0.7)" : colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LegendItem color={colors.primary} label="Period" colors={colors} />
        <LegendItem color={colors.accent} label="Ovulation" colors={colors} />
        <LegendItem color="#C8E6DE" label="Fertile Window" colors={colors} />
        <LegendItem color={colors.secondary} label="Predicted" colors={colors} bordered borderColor={colors.primary} />
      </View>

      {/* Selected day detail */}
      {selectedDate && selectedStatus && (
        <View style={[styles.dayDetail, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.detailDate, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
            {selectedStatus.isToday ? "  (Today)" : ""}
          </Text>

          {selectedPhaseLabel ? (
            <View style={[styles.phasePill, {
              backgroundColor:
                selectedStatus.isPeriod ? colors.secondary
                : selectedStatus.isOvulation || selectedStatus.isFertile ? "#E5F3EF"
                : colors.muted,
            }]}>
              <Text style={[styles.phasePillText, {
                color: selectedStatus.isPeriod ? colors.primary
                  : selectedStatus.isOvulation || selectedStatus.isFertile ? colors.accent
                  : colors.mutedForeground,
                fontFamily: "Inter_500Medium",
              }]}>
                {selectedPhaseLabel}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noDetail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {selectedStatus.isToday ? phaseName : "No data for this day"}
            </Text>
          )}

          {selectedLog && (
            <View style={styles.logDetail}>
              {selectedLog.flow && (
                <DetailRow icon="droplet" text={`Flow: ${selectedLog.flow}`} colors={colors} />
              )}
              {selectedLog.mood && (
                <DetailRow icon="smile" text={`Mood: ${selectedLog.mood}`} colors={colors} />
              )}
              {selectedLog.symptoms.length > 0 && (
                <DetailRow icon="list" text={selectedLog.symptoms.join(" · ")} colors={colors} />
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function LegendItem({
  color, label, colors, bordered, borderColor,
}: {
  color: string; label: string; colors: ReturnType<typeof useColors>;
  bordered?: boolean; borderColor?: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[
        styles.legendDot,
        { backgroundColor: color },
        bordered ? { borderWidth: 1.5, borderColor: borderColor ?? color } : {},
      ]} />
      <Text style={[styles.legendLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

function DetailRow({ icon, text, colors }: { icon: string; text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon as any} size={13} color={colors.mutedForeground} />
      <Text style={[styles.detailRowText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {text}
      </Text>
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 30, marginBottom: 20 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  navBtn: { padding: 10 },
  monthLabel: { fontSize: 16 },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  dayCell: {
    borderRadius: CELL_SIZE / 2,
  },
  dayText: { fontSize: 14 },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 12 },
  dayDetail: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  detailDate: { fontSize: 14 },
  phasePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  phasePillText: { fontSize: 13 },
  noDetail: { fontSize: 13 },
  logDetail: { gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  detailRowText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
