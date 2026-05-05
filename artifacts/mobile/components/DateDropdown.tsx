import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface DateDropdownProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  currentStartDate?: string;
}

function getRecentDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i <= 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const isToday = i === 0;
    dates.push({ value: dateStr, label, isToday });
  }
  return dates;
}

const dates = getRecentDates();

export function DateDropdown({ visible, onClose, onDateSelect, currentStartDate }: DateDropdownProps) {
  const colors = useColors();

  const handleSelect = (value: string) => {
    onDateSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Change Period Start Date
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {dates.map((date, index) => {
              const isSelected = currentStartDate === date.value;
              return (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.row,
                    {
                      backgroundColor: isSelected ? colors.primary + "18" : "transparent",
                      borderBottomColor: colors.border,
                      borderBottomWidth: index < dates.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}
                  onPress={() => handleSelect(date.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <Text style={[styles.rowLabel, { color: isSelected ? colors.primary : colors.foreground }]}>
                      {date.label}
                    </Text>
                    {date.isToday && (
                      <View style={[styles.todayBadge, { backgroundColor: colors.primary + "22" }]}>
                        <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
                      </View>
                    )}
                  </View>
                  {isSelected && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "70%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
