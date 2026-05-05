import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
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

const SYMPTOMS = [
  "Cramps", "Headache", "Bloating", "Backache",
  "Tender Breasts", "Fatigue", "Mood Swings", "Acne",
  "Nausea", "Food Cravings", "Insomnia", "Hot Flashes",
];

const MOODS = ["Amazing", "Good", "Okay", "Low", "Rough"];

const MOOD_ICONS: Record<string, string> = {
  Amazing: "star",
  Good: "smile",
  Okay: "meh",
  Low: "frown",
  Rough: "cloud",
};

type Flow = "spotting" | "light" | "medium" | "heavy";
const FLOWS: { key: Flow; label: string }[] = [
  { key: "spotting", label: "Spotting" },
  { key: "light", label: "Light" },
  { key: "medium", label: "Medium" },
  { key: "heavy", label: "Heavy" },
];

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isInPeriod, todayLog, saveDayLog, startPeriod, endPeriod, todayStr } = useCycle();

  const [periodOn, setPeriodOn] = useState(isInPeriod);
  const [flow, setFlow] = useState<Flow | undefined>(todayLog?.flow);
  const [symptoms, setSymptoms] = useState<string[]>(todayLog?.symptoms ?? []);
  const [mood, setMood] = useState<string | undefined>(todayLog?.mood);
  const [saved, setSaved] = useState(false);
  
  // Animated values for toggle switches
  const periodToggleAnim = useRef(new Animated.Value(periodOn ? 1 : 0)).current;

  useEffect(() => {
    setPeriodOn(isInPeriod);
    setFlow(todayLog?.flow);
    setSymptoms(todayLog?.symptoms ?? []);
    setMood(todayLog?.mood);
    
    // Animate toggle when period state changes
    Animated.timing(periodToggleAnim, {
      toValue: isInPeriod ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isInPeriod, todayLog]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleSymptom = (s: string) => {
    Haptics.selectionAsync();
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    setSaved(false);
  };

  const handlePeriodToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !periodOn;
    setPeriodOn(next);
    setSaved(false);
    if (next) {
      await startPeriod();
    } else {
      await endPeriod();
    }
  };

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveDayLog({ date: todayStr, flow: periodOn ? flow : undefined, symptoms, mood });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const today = new Date(todayStr + "T12:00:00");
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 110 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Daily Log
      </Text>
      <Text style={[styles.dateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {dateLabel}
      </Text>

      {/* Period toggle */}
      <SectionCard colors={colors}>
        <View style={styles.periodRow}>
          <View style={styles.periodLeft}>
            <View style={[styles.periodIconWrap, { backgroundColor: colors.secondary }]}>
              <Feather name="droplet" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Period
              </Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {periodOn ? "Active today" : "Not active"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: periodOn ? colors.primary : colors.muted },
            ]}
            onPress={handlePeriodToggle}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: colors.card,
                  transform: [{ translateX: periodOn ? 20 : 2 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Flow */}
        {periodOn && (
          <View style={styles.flowSection}>
            <Text style={[styles.subLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Flow intensity
            </Text>
            <View style={styles.flowRow}>
              {FLOWS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.flowChip,
                    {
                      backgroundColor: flow === f.key ? colors.primary : colors.secondary,
                      borderColor: flow === f.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => { setFlow(f.key); setSaved(false); }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.flowChipText,
                      {
                        color: flow === f.key ? colors.primaryForeground : colors.foreground,
                        fontFamily: "Inter_500Medium",
                      },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </SectionCard>

      {/* Mood */}
      <SectionCard colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Mood
        </Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.moodChip,
                {
                  backgroundColor: mood === m ? colors.primary : colors.secondary,
                  borderColor: mood === m ? colors.primary : colors.border,
                },
              ]}
              onPress={() => { setMood(mood === m ? undefined : m); setSaved(false); }}
              activeOpacity={0.8}
            >
              <Feather
                name={MOOD_ICONS[m] as any}
                size={16}
                color={mood === m ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.moodChipText,
                  {
                    color: mood === m ? colors.primaryForeground : colors.foreground,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SectionCard>

      {/* Symptoms */}
      <SectionCard colors={colors}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Symptoms
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 10 }]}>
          Tap all that apply
        </Text>
        <View style={styles.symptomsGrid}>
          {SYMPTOMS.map((s) => {
            const active = symptoms.includes(s);
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.symptomChip,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleSymptom(s)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.symptomText,
                    {
                      color: active ? colors.primaryForeground : colors.foreground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SectionCard>

      {/* Save button */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: saved ? colors.accent : colors.primary },
        ]}
        onPress={handleSave}
        activeOpacity={0.85}
      >
        <Feather
          name={saved ? "check" : "save"}
          size={18}
          color={saved ? colors.accentForeground : colors.primaryForeground}
        />
        <Text
          style={[
            styles.saveBtnText,
            {
              color: saved ? colors.accentForeground : colors.primaryForeground,
              fontFamily: "Inter_600SemiBold",
            },
          ]}
        >
          {saved ? "Saved!" : "Save Log"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionCard({ children, colors }: { children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 30, marginBottom: 4 },
  dateLabel: { fontSize: 13, marginBottom: 22 },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    gap: 10,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  periodLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  periodIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 15 },
  sectionSub: { fontSize: 12, marginTop: 1 },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  flowSection: { gap: 10, marginTop: 4 },
  subLabel: { fontSize: 12 },
  flowRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flowChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  flowChipText: { fontSize: 13 },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodChipText: { fontSize: 13 },
  symptomsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  symptomChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  symptomText: { fontSize: 13 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 18,
    gap: 8,
    marginTop: 4,
  },
  saveBtnText: { fontSize: 16 },
});
