import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface DateDropdownProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  currentStartDate?: string;
}

export function DateDropdown({ visible, onClose, onDateSelect, currentStartDate }: DateDropdownProps) {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState(currentStartDate || "");
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getRecentDates = () => {
    const dates = [];
    const today = new Date();
    
    // Add dates from today back to 60 days ago for more options
    for (let i = 0; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const dayNumber = date.getDate();
      const label = `${monthName} ${dayNumber}`;
      dates.push({ value: dateStr, label });
    }
    
    return dates;
  };

  const handleSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelect(date);
    onClose();
  };

  const dates = getRecentDates();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Change Period Start Date
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateListContainer}>
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={styles.horizontalScrollView}
              contentContainerStyle={styles.horizontalContent}
            >
              {dates.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.dateBox,
                    { 
                      backgroundColor: currentStartDate === date.value ? colors.primary + "20" : colors.background,
                      borderColor: currentStartDate === date.value ? colors.primary : colors.border,
                      borderWidth: 2,
                      shadowColor: colors.border,
                    }
                  ]}
                  onPress={() => handleSelect(date.value)}
                >
                  <View style={styles.dateContent}>
                    <Text 
                      style={[
                        styles.dateLabel,
                        { 
                          color: currentStartDate === date.value ? colors.primary : colors.foreground,
                          fontWeight: currentStartDate === date.value ? '600' : '500'
                        }
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {date.label}
                    </Text>
                    {currentStartDate === date.value && (
                      <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={10} color={colors.primaryForeground} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    maxWidth: 420,
    height: 500,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  horizontalScrollView: {
    flex: 1,
  },
  horizontalContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dateBox: {
    width: 100,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dateContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
