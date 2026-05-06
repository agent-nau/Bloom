import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface PeriodDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  title?: string;
  confirmLabel?: (month: string, day: number) => string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getAvailableMonths() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  return [
    { label: MONTH_NAMES[prevDate.getMonth()], month: prevDate.getMonth(), year: prevDate.getFullYear() },
    { label: MONTH_NAMES[currentMonth], month: currentMonth, year: currentYear },
  ];
}

export function PeriodDatePicker({ visible, onClose, onDateSelect, title = "When did your period start?", confirmLabel }: PeriodDatePickerProps) {
  const colors = useColors();
  const availableMonths = getAvailableMonths();

  const [selectedMonthIdx, setSelectedMonthIdx] = useState(1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const { month, year } = availableMonths[selectedMonthIdx];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleMonthSelect = (idx: number) => {
    setSelectedMonthIdx(idx);
    const newDays = new Date(availableMonths[idx].year, availableMonths[idx].month + 1, 0).getDate();
    if (selectedDay > newDays) setSelectedDay(newDays);
  };

  const handleConfirm = () => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    onDateSelect(dateStr);
    onClose();
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDay === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getButtonText = () => {
    if (!selectedDay || !month || !year) {
      return "Select Date";
    }
    if (confirmLabel) return confirmLabel(MONTH_NAMES[month], selectedDay);
    return `Started ${MONTH_NAMES[month]} ${selectedDay}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {title}
          </Text>

          <View style={styles.pickerContainer}>
            <View style={[styles.pickerColumn, { flex: 2 }]}>
              <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>Month</Text>
              <View style={styles.picker}>
                {availableMonths.map((m, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.pickerItem,
                      selectedMonthIdx === idx && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleMonthSelect(idx)}
                  >
                    <Text style={[
                      styles.pickerText,
                      { color: selectedMonthIdx === idx ? colors.primaryForeground : colors.foreground }
                    ]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.pickerColumn, { flex: 1 }]}>
              <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>Day</Text>
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      selectedDay === day && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[
                      styles.pickerText,
                      { color: selectedDay === day ? colors.primaryForeground : colors.foreground }
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.confirmButtonText, { color: colors.primaryForeground }]}>
                {getButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  picker: {
    maxHeight: 150,
    width: '100%',
  },
  pickerItem: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 2,
    width: '100%',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
