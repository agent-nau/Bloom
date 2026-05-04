import { Feather } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCycle } from "@/context/CycleContext";
import { useColors } from "@/hooks/useColors";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getDateStatus, todayStr, logs } = useCycle();

  const today = new Date(todayStr + "T12:00:00");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const goToPrev = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const goToNext = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }, [viewMonth]);

  const goToToday = useCallback(() => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDate(todayStr);
  }, [todayStr]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const formatCellDate = useCallback((day: number) => {
    const month = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${viewYear}-${month}-${dayStr}`;
  }, [viewYear, viewMonth]);

  const selectedLog = selectedDate ? logs.find((l) => l.date === selectedDate) ?? null : null;
  const selectedStatus = selectedDate ? getDateStatus(selectedDate) : null;

  const getFormattedDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  };

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const cells: (number | null)[] = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPad + 8,
          paddingBottom: bottomPad + 110,
          paddingHorizontal: 20,
        }}
      >
        {/* Page title */}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Calendar
        </Text>

        {/* Month navigation */}
        <View style={[styles.monthNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={goToPrev} style={styles.navBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.monthCenter}>
            <Text style={[styles.monthText, { color: colors.foreground }]}>
              {MONTHS[viewMonth]}
            </Text>
            <Text style={[styles.yearText, { color: colors.mutedForeground }]}>
              {viewYear}
            </Text>
          </View>

          <TouchableOpacity onPress={goToNext} style={styles.navBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="chevron-right" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Weekday header */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((wd, i) => (
              <View key={`wd-${i}`} style={styles.weekCell}>
                <Text style={[styles.weekdayLabel, { color: colors.mutedForeground }]}>
                  {wd}
                </Text>
              </View>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.daysGrid}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const dateStr = formatCellDate(day);
              const status = getDateStatus(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              let bg = "transparent";
              let circleStyle: object = {};
              let textColor = colors.foreground;
              let dotColor: string | null = null;

              if (status.isPeriod) {
                bg = colors.primary + "22";
                circleStyle = { borderColor: colors.primary, borderWidth: 1.5 };
                textColor = colors.primary;
                dotColor = colors.primary;
              } else if (status.isPredictedPeriod) {
                bg = colors.primary + "10";
                circleStyle = { borderColor: colors.primary + "50", borderWidth: 1, borderStyle: "dashed" as const };
                textColor = colors.primary;
              } else if (status.isOvulation) {
                bg = "#7BB3A0" + "25";
                circleStyle = { borderColor: "#7BB3A0", borderWidth: 1.5 };
                textColor = "#7BB3A0";
                dotColor = "#7BB3A0";
              } else if (status.isFertile) {
                bg = "#7BB3A0" + "14";
                circleStyle = { borderColor: "#7BB3A0" + "60", borderWidth: 1 };
                textColor = "#7BB3A0";
              }

              if (isToday) {
                bg = colors.primary;
                circleStyle = {};
                textColor = colors.primaryForeground;
                dotColor = null;
              }

              if (isSelected && !isToday) {
                circleStyle = { ...circleStyle, borderColor: colors.foreground, borderWidth: 2 };
              }

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={styles.dayCell}
                  onPress={() => setSelectedDate(dateStr)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      { backgroundColor: bg },
                      circleStyle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNum,
                        {
                          color: textColor,
                          fontWeight: isToday ? "700" : isSelected ? "600" : "400",
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                  {dotColor && !isToday && (
                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                  )}
                  {status.hasLog && !isToday && (
                    <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={[styles.legendRow]}>
          <LegendItem color={colors.primary} label="Period" />
          <LegendItem color={colors.primary + "50"} label="Predicted" dashed />
          <LegendItem color="#7BB3A0" label="Fertile" />
          <LegendItem color="#7BB3A0" label="Ovulation" dot />
        </View>

        {/* Today button if not current month */}
        {!isCurrentMonth && (
          <TouchableOpacity
            style={[styles.todayBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={goToToday}
          >
            <Feather name="calendar" size={15} color={colors.primary} />
            <Text style={[styles.todayBtnText, { color: colors.primary }]}>
              Go to today
            </Text>
          </TouchableOpacity>
        )}

        {/* Selected date details */}
        {selectedDate && selectedStatus && (
          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.detailDate, { color: colors.foreground }]}>
              {getFormattedDate(selectedDate)}
            </Text>

            {/* Phase badges */}
            <View style={styles.badgeRow}>
              {selectedStatus.isPeriod && (
                <PhaseBadge icon="droplet" label="Period" color={colors.primary} bg={colors.primary + "18"} />
              )}
              {selectedStatus.isPredictedPeriod && !selectedStatus.isPeriod && (
                <PhaseBadge icon="calendar" label="Predicted Period" color={colors.primary} bg={colors.primary + "10"} />
              )}
              {selectedStatus.isOvulation && (
                <PhaseBadge icon="zap" label="Ovulation" color="#7BB3A0" bg={"#7BB3A0" + "20"} />
              )}
              {selectedStatus.isFertile && !selectedStatus.isOvulation && (
                <PhaseBadge icon="sun" label="Fertile Window" color="#7BB3A0" bg={"#7BB3A0" + "15"} />
              )}
              {!selectedStatus.isPeriod && !selectedStatus.isPredictedPeriod && !selectedStatus.isOvulation && !selectedStatus.isFertile && (
                <Text style={[styles.noDataText, { color: colors.mutedForeground }]}>
                  No cycle data for this date
                </Text>
              )}
            </View>

            {/* Log details */}
            {selectedLog && (
              <View style={[styles.logSection, { borderTopColor: colors.border }]}>
                {selectedLog.flow && (
                  <LogRow icon="droplet" label={`Flow: ${capitalize(selectedLog.flow)}`} color={colors.mutedForeground} />
                )}
                {selectedLog.mood && (
                  <LogRow icon="smile" label={`Mood: ${capitalize(selectedLog.mood)}`} color={colors.mutedForeground} />
                )}
                {selectedLog.symptoms.length > 0 && (
                  <LogRow
                    icon="list"
                    label={selectedLog.symptoms.map(capitalize).join(", ")}
                    color={colors.mutedForeground}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function LegendItem({ color, label, dashed, dot }: { color: string; label: string; dashed?: boolean; dot?: boolean }) {
  const colors_hook = useColors();
  return (
    <View style={styles.legendItem}>
      {dot ? (
        <View style={[styles.legendDot, { backgroundColor: color }]} />
      ) : (
        <View
          style={[
            styles.legendSwatch,
            {
              backgroundColor: color + "30",
              borderColor: color,
              borderWidth: 1.5,
              borderStyle: dashed ? "dashed" : "solid",
            },
          ]}
        />
      )}
      <Text style={[styles.legendLabel, { color: colors_hook.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function PhaseBadge({ icon, label, color, bg }: { icon: string; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: color + "60" }]}>
      <Feather name={icon as any} size={13} color={color} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function LogRow({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.logRow}>
      <Feather name={icon as any} size={13} color={color} />
      <Text style={[styles.logRowText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  pageTitle: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 18,
    letterSpacing: -0.5,
  },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  navBtn: { padding: 4 },
  monthCenter: { alignItems: "center" },
  monthText: { fontSize: 18, fontWeight: "700" },
  yearText: { fontSize: 13, fontWeight: "500", marginTop: 1 },

  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 6,
  },
  weekdayLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.285714%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: {
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },

  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },

  detailCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 13,
    fontStyle: "italic",
  },

  logSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logRowText: {
    fontSize: 13,
    flex: 1,
  },
});
