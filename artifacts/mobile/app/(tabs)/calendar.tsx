import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCycle } from "@/context/CycleContext";
import { useColors } from "@/hooks/useColors";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getDateStatus, todayStr, phaseName, logs, cycles } = useCycle();

  const today = new Date(todayStr + "T12:00:00");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when cycles change
  React.useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [cycles]);

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
  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDate(todayStr);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const formatCellDate = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${viewYear}-${month}-${dayStr}`;
  };

  const getDayStyle = (day: number) => {
    const dateStr = formatCellDate(day);
    const status = getDateStatus(dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;

    let bg = "transparent";
    let textColor = colors.foreground;
    let borderColor = "transparent";
    let borderWidth = 0;
    let borderRadius = 8;

    if (status.isPeriod) {
      bg = colors.primary + "20";
      borderColor = colors.primary;
      borderWidth = 2;
    } else if (status.isPredictedPeriod) {
      bg = colors.primary + "10";
      borderColor = colors.primary + "40";
      borderWidth = 1;
    } else if (status.isOvulation) {
      bg = "#FF6B6B" + "20";
      borderColor = "#FF6B6B";
      borderWidth = 2;
    } else if (status.isFertile) {
      bg = "#4ECDC4" + "20";
      borderColor = "#4ECDC4";
      borderWidth = 1;
    }

    if (isToday) {
      bg = colors.primary + "30";
      borderColor = colors.primary;
      borderWidth = 2;
      borderRadius = 12;
    }

    if (isSelected) {
      borderColor = colors.primary;
      borderWidth = 3;
      borderRadius = 12;
    }

    return { bg, textColor, borderColor, borderWidth, borderRadius, hasLog: status.hasLog };
  };

  const getSelectedDateInfo = () => {
    if (!selectedDate) return null;
    const status = getDateStatus(selectedDate);
    const date = new Date(selectedDate + "T12:00:00");
    const formatted = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return { formatted, status };
  };

  const selectedInfo = getSelectedDateInfo();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: topPad }}>
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} style={{ flex: 1 }}>
          <View style={styles.content}>
            {/* Traditional Calendar Header */}
            <View style={[styles.calendarHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={goToPrev} style={styles.navButton}>
                  <Feather name="chevron-left" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.monthYearText, { color: colors.foreground }]}>
                  {MONTHS[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={goToNext} style={styles.navButton}>
                  <Feather name="chevron-right" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.todayButton, { backgroundColor: colors.primary }]}
                onPress={goToToday}
              >
                <Text style={[styles.todayButtonText, { color: colors.primaryForeground }]}>
                  Today
                </Text>
              </TouchableOpacity>
            </View>

            {/* Traditional Calendar Grid */}
            <View style={[styles.calendarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Weekday Headers */}
              <View style={styles.weekdayHeader}>
                {WEEKDAYS.map((wd) => (
                  <View key={wd} style={styles.weekdayCell}>
                    <Text style={[styles.weekdayText, { color: colors.mutedForeground }]}>
                      {wd}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View key={`calendar-${refreshKey}`} style={styles.daysGrid}>
                {cells.map((day, idx) => {
                  if (!day) {
                    return <View key={`empty-${idx}-${refreshKey}`} style={styles.emptyDayCell} />;
                  }
                  const ds = getDayStyle(day);
                  const dateStr = formatCellDate(day);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  
                  return (
                    <TouchableOpacity
                      key={`${dateStr}-${refreshKey}`}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: ds.bg,
                          borderColor: ds.borderColor,
                          borderWidth: ds.borderWidth,
                          borderRadius: ds.borderRadius,
                        },
                      ]}
                      onPress={() => setSelectedDate(dateStr)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          {
                            color: ds.textColor,
                            fontWeight: isToday ? "700" : isSelected ? "600" : "500",
                            fontSize: isToday ? 16 : 14,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                      {ds.hasLog && (
                        <View style={[styles.logIndicator, { backgroundColor: colors.primary }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Cycle Legend */}
            <View style={[styles.legendContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.legendTitle, { color: colors.foreground }]}>
                Cycle Phases
              </Text>
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.foreground }]}>Period</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.primary + "60" }]} />
                  <Text style={[styles.legendText, { color: colors.foreground }]}>Predicted</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#FF6B6B" }]} />
                  <Text style={[styles.legendText, { color: colors.foreground }]}>Ovulation</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: "#4ECDC4" }]} />
                  <Text style={[styles.legendText, { color: colors.foreground }]}>Fertile</Text>
                </View>
              </View>
            </View>

            {/* Selected Date Details */}
            {selectedInfo && (
              <View style={[styles.detailsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailsDate, { color: colors.foreground }]}>
                  {selectedInfo.formatted}
                </Text>
                
                <View style={styles.phaseInfo}>
                  {selectedInfo.status.isPeriod && (
                    <View style={[styles.phaseBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
                      <Feather name="droplet" size={16} color={colors.primary} />
                      <Text style={[styles.phaseText, { color: colors.primary }]}>
                        Period Day
                      </Text>
                    </View>
                  )}
                  {selectedInfo.status.isPredictedPeriod && !selectedInfo.status.isPeriod && (
                    <View style={[styles.phaseBadge, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "40" }]}>
                      <Feather name="calendar" size={16} color={colors.primary} />
                      <Text style={[styles.phaseText, { color: colors.primary }]}>
                        Predicted Period
                      </Text>
                    </View>
                  )}
                  {selectedInfo.status.isOvulation && (
                    <View style={[styles.phaseBadge, { backgroundColor: "#FF6B6B" + "20", borderColor: "#FF6B6B" }]}>
                      <Feather name="zap" size={16} color="#FF6B6B" />
                      <Text style={[styles.phaseText, { color: "#FF6B6B" }]}>
                        Ovulation
                      </Text>
                    </View>
                  )}
                  {selectedInfo.status.isFertile && !selectedInfo.status.isOvulation && (
                    <View style={[styles.phaseBadge, { backgroundColor: "#4ECDC4" + "20", borderColor: "#4ECDC4" }]}>
                      <Feather name="sun" size={16} color="#4ECDC4" />
                      <Text style={[styles.phaseText, { color: "#4ECDC4" }]}>
                        Fertile Window
                      </Text>
                    </View>
                  )}
                  {!selectedInfo.status.isPeriod && !selectedInfo.status.isPredictedPeriod && !selectedInfo.status.isOvulation && !selectedInfo.status.isFertile && (
                    <Text style={[styles.noDataText, { color: colors.mutedForeground }]}>
                      No cycle data for this date
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  
  // Traditional Calendar Header
  calendarHeader: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '700',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Traditional Calendar Grid
  calendarContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: 8,
  },
  emptyDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    margin: 1,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  logIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  
  // Legend
  legendContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Details
  detailsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  detailsDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  phaseInfo: {
    gap: 8,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 8,
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
