import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/context/UserContext";
import { useCycle } from "@/context/CycleContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileTabScreen() {
  const { profile, updateProfile } = useUser();
  const { clearAllData } = useCycle();
  const { themeMode, isDark, setThemeMode } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile?.firstName || "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const initial = (profile?.firstName || "?").charAt(0).toUpperCase();

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    await updateProfile({ firstName: tempName.trim() });
    setIsEditingName(false);
  };

  const handleDeleteHistory = () => {
    Alert.alert(
      "Delete Period History",
      "This will permanently delete all your cycle data, logs, symptoms, and mood entries. Your profile and settings will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert("Done", "All period history has been deleted.");
            } catch {
              Alert.alert("Error", "Failed to delete data. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: bottomPad + 100,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={{ fontSize: 30, fontWeight: "700", color: colors.foreground, marginBottom: 24, letterSpacing: -0.5 }}>
          Profile
        </Text>

        {/* ── Avatar & Name card ── */}
        <View style={[card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {/* Initial bubble */}
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text style={{ fontSize: 26, fontWeight: "700", color: colors.primaryForeground }}>
                {initial}
              </Text>
            </View>

            {/* Name */}
            {isEditingName ? (
              <View style={{ flex: 1, gap: 8 }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: colors.input,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: colors.foreground,
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                  }}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Your name"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
                    onPress={handleSaveName}
                  >
                    <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: 14 }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: colors.secondary, borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
                    onPress={() => { setTempName(profile?.firstName || ""); setIsEditingName(false); }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>
                  {profile?.firstName || "No name set"}
                </Text>
                <TouchableOpacity
                  onPress={() => { setTempName(profile?.firstName || ""); setIsEditingName(true); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}
                >
                  <Feather name="edit-2" size={13} color={colors.primary} />
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}>Edit name</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── Appearance ── */}
        <View style={[card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 }]}>
          <Text style={sectionTitle(colors)}>Appearance</Text>

          {/* Pill toggle */}
          <View style={{
            flexDirection: "row",
            backgroundColor: colors.muted,
            borderRadius: 12,
            padding: 4,
            gap: 4,
          }}>
            {(["light", "dark"] as const).map((mode) => {
              const active = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    paddingVertical: 10,
                    borderRadius: 9,
                    backgroundColor: active ? colors.card : "transparent",
                    ...(active ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                    } : {}),
                  }}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={mode === "light" ? "sun" : "moon"}
                    size={15}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: active ? "600" : "400",
                    color: active ? colors.primary : colors.mutedForeground,
                  }}>
                    {mode === "light" ? "Light" : "Dark"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── About ── */}
        <View style={[card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 }]}>
          <Text style={sectionTitle(colors)}>About</Text>
          <View style={{ gap: 12 }}>
            <Row label="App" value="Bloom" colors={colors} />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Row label="Version" value="1.0.0" colors={colors} />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Row label="Data storage" value="On-device only" colors={colors} />
          </View>
        </View>

        {/* ── Danger Zone ── */}
        <View style={[card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={sectionTitle(colors)}>Data</Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              backgroundColor: "#FF3B3010",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FF3B3040",
            }}
            onPress={handleDeleteHistory}
            activeOpacity={0.7}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#FF3B3018",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Feather name="trash-2" size={17} color="#FF3B30" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#FF3B30" }}>
                Delete Period History
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                Cycles, logs, symptoms & moods
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#FF3B3080" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const card = {
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
};

const sectionTitle = (colors: ReturnType<typeof useColors>) => ({
  fontSize: 13,
  fontWeight: "600" as const,
  color: colors.mutedForeground,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  marginBottom: 16,
});

function Row({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}
